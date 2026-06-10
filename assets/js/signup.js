import { ApiService } from './api.js';

async function handleReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const companySlug = urlParams.get('company_slug');

    if (!companySlug) {
        // No referral, run standard signup logic
        initializeStandardSignup();
        return false; // Not a referral
    }

    // Referral link detected, run branded signup
    await initializeBrandedSignup(companySlug);
    return true; // Is a referral
}

async function initializeBrandedSignup(companySlug) {
    // Hide general title and show loading for branding
    document.querySelector('#signup-form').classList.add('hidden');
    document.querySelector('.text-center h1').innerText = 'Memuat Halaman Pendaftaran...';
    document.querySelector('.text-center p').classList.add('hidden');

    try {
        const devInfo = await ApiService.get(`get_public_developer_info.php?slug=${companySlug}`);

        // Apply branding
        const brandingSection = document.getElementById('branding-section');
        const devLogo = document.getElementById('developer-logo');
        const devName = document.getElementById('developer-name');

        devLogo.src = devInfo.logo_url || 'https://via.placeholder.com/150/E2E8F0/94A3B8?text=Logo';
        devName.innerText = devInfo.app_name || devInfo.nama_perusahaan;
        brandingSection.classList.remove('hidden');

        // Update main titles
        document.querySelector('.text-center h1').innerText = 'Buat Akun Baru';
        document.querySelector('.text-center p').innerText = `Bergabunglah dengan tim ${devInfo.nama_perusahaan}.`;
        document.querySelector('.text-center p').classList.remove('hidden');

        // Configure the form for referral signup
        document.getElementById('existing-developer-container').classList.add('hidden');
        document.getElementById('new-developer-container').classList.add('hidden');

        // Limit role selection for referred users
        const roleSelect = document.getElementById('role-select');
        roleSelect.innerHTML = `
            <option value="Agent Freelance">Agent Freelance</option>
            <option value="Admin CS">Admin CS</option>
        `;

        // Add a hidden input with the developer_id for form submission
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'developer_id';
        hiddenInput.value = devInfo.id;
        document.getElementById('signup-form').prepend(hiddenInput);
        
        document.querySelector('#signup-form').classList.remove('hidden');

    } catch (error) {
        document.querySelector('.text-center h1').innerText = 'Link Pendaftaran Tidak Valid';
        document.querySelector('.text-center p').innerText = error.message;
        document.querySelector('.text-center p').classList.remove('hidden');
        throw error; // Stop further execution
    }
}

async function initializeStandardSignup() {
    const developerSelect = document.getElementById('developer-select');
    const roleSelect = document.getElementById('role-select');
    const existingDeveloperContainer = document.getElementById('existing-developer-container');
    const newDeveloperContainer = document.getElementById('new-developer-container');
    const newDeveloperInput = newDeveloperContainer.querySelector('input');

    // 1. Populate Developer List
    try {
        const developers = await ApiService.getDevelopers();
        developerSelect.innerHTML = '<option value="">-- Pilih Perusahaan --</option>'; // Clear loading text
        developers.forEach(dev => {
            const option = document.createElement('option');
            option.value = dev.id;
            option.textContent = dev.nama_perusahaan;
            developerSelect.appendChild(option);
        });
    } catch (error) {
        developerSelect.innerHTML = '<option value="">Gagal memuat data</option>';
        console.error('Failed to load developers:', error);
    }

    // 2. Handle Role Change to Show/Hide Fields
    roleSelect.addEventListener('change', (e) => {
        const selectedRole = e.target.value;
        if (selectedRole === 'Developer') {
            existingDeveloperContainer.classList.add('hidden');
            newDeveloperContainer.classList.remove('hidden');
            developerSelect.required = false;
            newDeveloperInput.required = true;
        } else {
            existingDeveloperContainer.classList.remove('hidden');
            newDeveloperContainer.classList.add('hidden');
            developerSelect.required = true;
            newDeveloperInput.required = false;
        }
    });
    roleSelect.dispatchEvent(new Event('change'));
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await handleReferral();
    } catch (error) {
        // If referral initialization fails, don't attach form listener
        console.error("Initialization failed, form submission blocked.");
        return;
    }

    const signupForm = document.getElementById('signup-form');
    const signupButton = document.getElementById('btn-signup');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalButtonText = signupButton.innerHTML;
        signupButton.innerHTML = 'Mendaftarkan...';
        signupButton.disabled = true;

        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await ApiService.signup(data);
            alert(response.message);
            window.location.href = 'login.html'; // Redirect to login page on success
        } catch (error) {
            alert('Gagal mendaftar: ' + error.message);
            signupButton.innerHTML = originalButtonText;
            signupButton.disabled = false;
        }
    });
    
    if(window.lucide) window.lucide.createIcons();
});