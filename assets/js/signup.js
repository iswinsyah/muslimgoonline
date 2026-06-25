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

    // --- Terms and Agreement Handlers ---
    const checkbox = document.getElementById('agreement-checkbox');
    const termsModal = document.getElementById('terms-modal');
    const btnShowTerms = document.getElementById('btn-show-terms');
    const btnCloseTerms = document.getElementById('btn-close-terms');
    const btnAgreeTerms = document.getElementById('btn-agree-terms');

    if (checkbox && signupButton) {
        checkbox.addEventListener('change', () => {
            signupButton.disabled = !checkbox.checked;
        });
    }

    if (btnShowTerms && termsModal) {
        btnShowTerms.addEventListener('click', (e) => {
            e.preventDefault();
            termsModal.classList.remove('hidden');
        });
    }

    const closeTerms = () => {
        if (termsModal) termsModal.classList.add('hidden');
    };

    if (btnCloseTerms) {
        btnCloseTerms.addEventListener('click', closeTerms);
    }

    if (btnAgreeTerms) {
        btnAgreeTerms.addEventListener('click', () => {
            if (checkbox) checkbox.checked = true;
            if (signupButton) signupButton.disabled = false;
            closeTerms();
        });
    }

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