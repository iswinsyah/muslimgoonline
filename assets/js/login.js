import { ApiService } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('btn-login');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalButtonText = loginButton.innerHTML;
        loginButton.innerHTML = 'Memverifikasi...';
        loginButton.disabled = true;

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            // Langsung panggil API login yang baru
            const response = await ApiService.post('login.php', data);
            
            const { user } = response;
            // Simpan data user di localStorage untuk digunakan di halaman utama
            localStorage.setItem('mgo_user', JSON.stringify(user));

            if (user.role === 'Developer' && user.is_first_login) {
                window.location.href = 'index.php#settings'; // Redirect ke halaman setting
            } else {
                window.location.href = 'index.php'; // Redirect ke dashboard seperti biasa
            }
        } catch (error) {
            alert('Login Gagal: ' + error.message);
            loginButton.innerHTML = originalButtonText;
            loginButton.disabled = false;
        }
    });
});