import { ApiService } from '../api.js';
import { UI } from '../ui.js';

export class ImpersonationComponent {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        this.ui = new UI();
        this.users = [];
    }

    async render() {
        this.container.innerHTML = this.ui.renderLoading('Memuat daftar pengguna...');
        try {
            this.users = await ApiService.getAllUsers();
            this.container.innerHTML = this.renderUserList();
            this.attachEventListeners();
        } catch (error) {
            this.container.innerHTML = this.ui.renderError('Gagal memuat daftar pengguna.');
            console.error(error);
        }
    }

    renderUserList() {
        const userRows = this.users.map(user => `
            <tr class="border-b hover:bg-slate-50/50 transition-colors">
                <td class="p-4 font-bold text-slate-700">${user.nama_user}</td>
                <td class="p-4 text-slate-600">${user.username}</td>
                <td class="p-4 text-slate-500">${user.role}</td>
                <td class="p-4 text-[#F8843F] font-semibold">${user.nama_perusahaan || 'N/A'}</td>
                <td class="p-4 text-right">
                    <button data-user-id="${user.id}" class="login-as-btn bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center">
                        <i data-lucide="log-in" class="w-4 h-4 mr-2"></i>
                        Login As
                    </button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-md">
                <h2 class="text-xl font-black text-slate-800 uppercase tracking-wider">Mode Penyamaran (Login As)</h2>
                <p class="text-sm text-slate-500 mt-1">Pilih pengguna untuk login sebagai mereka dan melihat aplikasi dari sudut pandang mereka untuk debugging.</p>
                <div class="mt-4">
                    <input type="text" id="user-search-input" placeholder="Cari nama atau username..." class="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]">
                </div>
                <div class="overflow-x-auto mt-6">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-black tracking-wider">
                            <tr>
                                <th class="p-4">Nama Lengkap</th>
                                <th class="p-4">Username</th>
                                <th class="p-4">Role</th>
                                <th class="p-4">Perusahaan</th>
                                <th class="p-4"></th>
                            </tr>
                        </thead>
                        <tbody id="user-list-body">${userRows}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (window.lucide) window.lucide.createIcons();

        this.container.querySelectorAll('.login-as-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.userId;
                this.loginAs(userId);
            });
        });
        
        const searchInput = this.container.querySelector('#user-search-input');
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = this.container.querySelectorAll('#user-list-body tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    async loginAs(userId) {
        const targetUser = this.users.find(u => u.id == userId);
        if (!targetUser) {
            alert('User tidak ditemukan!');
            return;
        }

        if (!confirm(`Anda akan login sebagai ${targetUser.nama_user}. Sesi Super Admin Anda akan disimpan. Lanjutkan?`)) {
            return;
        }

        try {
            // Ambil data lengkap user dari server untuk memastikan sesi valid
            const fullTargetUserResponse = await ApiService.getUserForImpersonation(userId);
            const fullTargetUser = fullTargetUserResponse.user;

            // Simpan sesi Super Admin saat ini
            const superAdminUser = localStorage.getItem('mgo_user');
            localStorage.setItem('mgo_super_admin_session', superAdminUser);
            
            // Set sesi baru sebagai user target
            localStorage.setItem('mgo_user', JSON.stringify(fullTargetUser));
            
            // Reload halaman untuk memulai sesi baru
            window.location.href = 'index.php';

        } catch (error) {
            alert('Gagal melakukan login as: ' + error.message);
        }
    }
}