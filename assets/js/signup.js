// Trigger redeploy: 1
import { ApiService } from './api.js';

async function handleReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const companySlug = urlParams.get('company_slug');
    // Sesuai aturan baru: Hanya Developer yang bisa daftar langsung.
    // Admin CS dan Agent didaftarkan oleh Developer di dalam aplikasi.
    initializeStandardSignup();
    return false;
}

async function initializeStandardSignup() {
    const roleSelect = document.getElementById('role-select');
    const newDeveloperContainer = document.getElementById('new-developer-container');
    const newDeveloperInput = newDeveloperContainer.querySelector('input');

    // Paksa Role hanya Developer dan sembunyikan pilihan role
    roleSelect.innerHTML = `<option value="Developer" selected>Developer / Owner</option>`;
    roleSelect.closest('div').classList.add('hidden');
    
    // Tampilkan input nama perusahaan
    newDeveloperContainer.classList.remove('hidden');
    newDeveloperInput.required = true;
    
    // Sembunyikan pilihan "Pilih Perusahaan" karena Developer membuat perusahaan baru
    const existingDevContainer = document.getElementById('existing-developer-container');
    if (existingDevContainer) {
        existingDevContainer.classList.add('hidden');
        const devSelect = existingDevContainer.querySelector('select');
        if (devSelect) devSelect.required = false;
    }
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