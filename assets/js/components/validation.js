import { ApiService } from '../api.js';
import { UI } from '../ui.js';

export class ValidationComponent {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        this.ui = new UI();
        this.state = {
            pending: []
        };
    }

    async render() {
        this.container.innerHTML = this.ui.renderLoading('Memuat data pendaftar...');
        try {
            this.state.pending = await ApiService.getPendingDevelopers();
            this.container.innerHTML = this.state.pending.length === 0 
                ? this.renderEmptyState() 
                : this.renderTable();
            this.attachEventListeners();
        } catch (error) {
            this.container.innerHTML = this.ui.renderError('Gagal memuat data validasi.');
            console.error(error);
        }
    }

    renderEmptyState() {
        return `
            <div class="text-center p-10 bg-white rounded-2xl shadow-md">
                <i data-lucide="check-check" class="w-16 h-16 mx-auto text-green-500"></i>
                <h3 class="mt-4 text-lg font-bold text-slate-700">Tidak Ada Pendaftar Baru</h3>
                <p class="mt-1 text-sm text-slate-500">Semua pendaftaran sudah divalidasi.</p>
            </div>
        `;
    }

    renderTable() {
        const rows = this.state.pending.map(dev => `
            <tr class="border-b hover:bg-slate-50/50 transition-colors" data-id="${dev.id}">
                <td class="p-4 font-bold text-slate-700">${dev.nama_perusahaan}</td>
                <td class="p-4 text-slate-600">${dev.nama_pemilik}</td>
                <td class="p-4 text-slate-600">${dev.kontak}</td>
                <td class="p-4 text-slate-500 text-xs">${new Date(dev.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                <td class="p-4">
                    <a href="/${dev.bukti_pembayaran}" target="_blank" class="text-xs font-bold text-teal-600 hover:underline">Lihat Bukti</a>
                </td>
                <td class="p-4 flex items-center space-x-2">
                    <button data-action="approve" class="action-btn bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-sm transition-all">
                        <i data-lucide="check" class="w-4 h-4 mr-1.5"></i> Terima
                    </button>
                    <button data-action="reject" class="action-btn bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-sm transition-all">
                        <i data-lucide="x" class="w-4 h-4 mr-1.5"></i> Tolak
                    </button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-md">
                <h2 class="text-xl font-black text-slate-800 uppercase tracking-wider">Validasi Pendaftaran Perusahaan</h2>
                <p class="text-sm text-slate-500 mt-1">Setujui atau tolak pendaftaran perusahaan baru.</p>
                <div class="overflow-x-auto mt-6">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-black tracking-wider">
                            <tr>
                                <th class="p-4">Nama Perusahaan</th>
                                <th class="p-4">Nama Pemilik</th>
                                <th class="p-4">Kontak</th>
                                <th class="p-4">Tanggal Daftar</th>
                                <th class="p-4">Pembayaran</th>
                                <th class="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (window.lucide) window.lucide.createIcons();

        this.container.querySelectorAll('.action-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                const row = btn.closest('tr');
                const developerId = row.dataset.id;
                const action = btn.dataset.action;
                const status = action === 'approve' ? 'Active' : 'Rejected';

                const companyName = row.querySelector('td').innerText;
                if (!confirm(`Apakah Anda yakin ingin ${action} pendaftaran untuk "${companyName}"?`)) {
                    return;
                }

                btn.disabled = true;
                btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>`;
                if (window.lucide) window.lucide.createIcons();

                try {
                    const response = await ApiService.updateDeveloperStatus(developerId, status);
                    this.ui.showToast(response.message);
                    
                    // Remove the row from the UI
                    row.style.transition = 'opacity 0.5s';
                    row.style.opacity = '0';
                    setTimeout(() => {
                        row.remove();
                        if (this.container.querySelector('tbody').children.length === 0) {
                            this.container.innerHTML = this.renderEmptyState();
                            if (window.lucide) window.lucide.createIcons();
                        }
                    }, 500);

                } catch (error) {
                    this.ui.showToast(`Gagal: ${error.message}`, 'error');
                    btn.disabled = false;
                    btn.innerHTML = `<i data-lucide="${action === 'approve' ? 'check' : 'x'}" class="w-4 h-4"></i>`;
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        });
    }
}