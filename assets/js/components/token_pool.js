import { ApiService } from '../api.js';
import { UI } from '../ui.js';

export class TokenPoolComponent {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        this.ui = new UI();
        this.state = {
            tokens: []
        };
    }

    async render() {
        this.container.innerHTML = this.ui.renderLoading('Memuat gudang stok token...');
        try {
            // Kita asumsikan ada API get_token_pool.php (akan kita buat jika perlu)
            // Untuk sekarang kita render form input dan list dummy/kosong
            this.container.innerHTML = `
                <div class="max-w-5xl mx-auto space-y-8">
                    <!-- FORM INPUT STOK BARU -->
                    <div class="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div class="flex items-center mb-6">
                            <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mr-4">
                                <i data-lucide="plus-circle" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h3 class="text-sm md:text-lg font-black text-slate-800 uppercase tracking-widest italic">Tambah Stok Token Fonnte</h3>
                                <p class="text-[10px] md:text-xs text-slate-500 font-medium mt-1">Masukkan token dari Fonnte untuk dijadikan stok otomatis AI.</p>
                            </div>
                        </div>
                        <form id="add-token-form" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="space-y-1">
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor WA Device</label>
                                <input type="text" name="wa_number" placeholder="628123..." class="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500" required>
                            </div>
                            <div class="space-y-1 md:col-span-1">
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Token API Fonnte</label>
                                <input type="text" name="token" placeholder="Paste Token di sini..." class="w-full bg-slate-50 border p-3 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-teal-500" required>
                            </div>
                            <div class="flex items-end">
                                <button type="submit" class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all active:scale-95">
                                    Simpan ke Gudang
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- DAFTAR STOK TOKEN -->
                    <div class="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl">
                        <div class="flex justify-between items-center mb-6">
                            <p class="text-[9px] font-black text-teal-400 uppercase tracking-widest flex items-center">
                                <i data-lucide="database" class="w-4 h-4 mr-2"></i> Inventori Token Tersedia
                            </p>
                            <span id="stock-count" class="bg-teal-500 text-[9px] font-black px-3 py-1 rounded-full uppercase">Memuat...</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-[10px] text-left">
                                <thead class="text-slate-500 uppercase font-black border-b border-white/10">
                                    <tr>
                                        <th class="p-3">WA Number</th>
                                        <th class="p-3">Token (Masked)</th>
                                        <th class="p-3">Status</th>
                                        <th class="p-3">Diberikan Ke</th>
                                    </tr>
                                </thead>
                                <tbody id="token-pool-list" class="divide-y divide-white/5">
                                    <!-- Data akan dimuat di sini -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            this.attachEventListeners();
            this.loadTokens(); 
        } catch (error) {
            this.container.innerHTML = this.ui.renderError('Gagal memuat komponen gudang token.');
        }
    }

    async loadTokens() {
        const tbody = document.getElementById('token-pool-list');
        const countBadge = document.getElementById('stock-count');
        try {
            const tokens = await ApiService.get('get_token_pool.php');
            const available = tokens.filter(t => t.status === 'Available').length;
            
            countBadge.innerText = `${available} Tersedia`;
            
            if (tokens.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-slate-500 italic">Gudang kosong.</td></tr>`;
                return;
            }

            tbody.innerHTML = tokens.map(t => `
                <tr class="border-b border-white/5 hover:bg-white/5">
                    <td class="p-3 font-bold">${t.wa_number}</td>
                    <td class="p-3 font-mono text-slate-400">${t.token.substring(0, 6)}***</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${t.status === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}">${t.status}</span>
                    </td>
                    <td class="p-3 text-slate-300">${t.nama_perusahaan || '-'}</td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-red-400 text-center">Gagal memuat data.</td></tr>`;
        }
    }

    attachEventListeners() {
        if (window.lucide) window.lucide.createIcons();

        const form = this.container.querySelector('#add-token-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            btn.disabled = true;
            btn.innerText = "Menyimpan...";

            try {
                const response = await ApiService.post('add_token_to_pool.php', data);
                this.ui.showToast(response.message);
                form.reset();
                // Re-render atau refresh list
                this.render();
            } catch (error) {
                this.ui.showToast(error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerText = "Simpan ke Gudang";
            }
        });
    }
}