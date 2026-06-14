import { ApiService } from '../api.js';

export class ClientManagementComponent {
    constructor(containerId) { 
        this.container = document.getElementById(containerId); 
    }
    
    async render() {
        if(!this.container) return;
        
        this.container.innerHTML = `<div class="p-10 text-center"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto text-slate-400"></i><p class="text-xs text-slate-400 mt-2 font-bold">Memuat data client...</p></div>`;
        if(window.lucide) window.lucide.createIcons();

        // Ambil data developer asli dari server
        let clients = [];
        try { 
            clients = await ApiService.getDevelopers(); 
        } catch(e) { 
            console.error(e); 
        }

        this.container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-8">
                <!-- Header -->
                <div class="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 class="text-lg md:text-xl font-black text-slate-800 uppercase tracking-widest italic">Client Management</h3>
                        <p class="text-xs text-slate-500 font-medium mt-1">Kelola konfigurasi, langganan, dan pantau pemakaian API tiap tenant.</p>
                    </div>
                </div>

                <!-- Table -->
                <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-6 md:p-8 border-b bg-slate-50 flex justify-between items-center">
                        <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest italic">Developer Portfolio</h3>
                    </div>
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left min-w-[600px]">
                            <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <tr>
                                    <th class="px-6 py-5">Developer Name</th>
                                    <th class="px-6 py-5">WhatsApp Gateway</th>
                                    <th class="px-6 py-5">Fonnte API Token</th>
                                    <th class="px-6 py-5">Status</th>
                                    <th class="px-6 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="text-xs md:text-sm font-bold">
                                ${clients.length === 0 ? `
                                <tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 italic">Belum ada client terdaftar.</td></tr>
                                ` : clients.map(c => `
                                <tr class="border-b last:border-0 hover:bg-slate-50 transition-colors" 
                                    data-id="${c.id}" 
                                    data-name="${c.nama_perusahaan}" 
                                    data-wa="${c.wa_number || ''}" 
                                    data-token="${c.fonnte_token || ''}" 
                                    data-status="${c.status_langganan || 'Pending'}">
                                    <td class="px-6 py-4 md:py-6 text-slate-700 whitespace-nowrap">${c.nama_perusahaan}</td>
                                    <td class="px-6 py-4 md:py-6 text-slate-600 whitespace-nowrap font-mono">${c.wa_number || '-'}</td>
                                    <td class="px-6 py-4 md:py-6 text-slate-500 whitespace-nowrap font-mono text-xs">${c.fonnte_token ? (c.fonnte_token.substring(0, 8) + '...') : '-'}</td>
                                    <td class="px-6 py-4 md:py-6 whitespace-nowrap">
                                        <span class="px-2 py-1 ${c.status_langganan === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'} rounded text-[9px] font-black uppercase">${c.status_langganan || 'Pending'}</span>
                                    </td>
                                    <td class="px-6 py-4 md:py-6 whitespace-nowrap text-right space-x-2">
                                        <button class="btn-view-usage text-teal-600 text-[10px] md:text-xs font-black uppercase hover:underline">Tagihan</button>
                                        <span class="text-slate-300">|</span>
                                        <button class="btn-manage-ai text-[#2845D6] text-[10px] md:text-xs font-black uppercase hover:underline">Kelola AI</button>
                                    </td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal Kelola AI -->
            <div id="manageAiModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md hidden p-4">
                <div class="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in text-left">
                    <div class="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
                        <h3 class="text-base font-black uppercase tracking-tighter" id="modal-client-title">Kelola Konfigurasi CS AI</h3>
                        <button type="button" id="btn-close-ai-modal" class="p-2 hover:bg-white/10 rounded-xl"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <form id="manageAiForm" class="p-6 space-y-4">
                        <input type="hidden" id="edit-dev-id" name="developer_id" />
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nomor WhatsApp Gateway</label>
                            <input id="edit-wa-number" name="wa_number" type="text" placeholder="Contoh: 6281234567890" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                            <p class="text-[8px] text-slate-400 mt-1">Nomor WhatsApp Gateway yang terdaftar di Fonnte.</p>
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fonnte API Token</label>
                            <input id="edit-fonnte-token" name="fonnte_token" type="text" placeholder="Masukkan Token Fonnte untuk Client ini" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                            <p class="text-[8px] text-slate-400 mt-1">Hubungkan device gateway ini dengan token Fonnte (White-label).</p>
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Langganan</label>
                            <select id="edit-status" name="status" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div class="flex space-x-3 pt-4">
                            <button type="button" id="btn-cancel-ai" class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest font-bold">Batal</button>
                            <button type="submit" class="flex-2 w-full py-3 bg-[#2845D6] hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase shadow-xl transition-all tracking-widest font-bold">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal Laporan Pemakaian & Tagihan -->
            <div id="usageModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md hidden p-4">
                <div class="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in text-left">
                    <div class="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
                        <h3 class="text-base font-black uppercase tracking-tighter" id="modal-usage-title">Laporan Pemakaian & Estimasi Tagihan</h3>
                        <button type="button" id="btn-close-usage-modal" class="p-2 hover:bg-white/10 rounded-xl"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <div class="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <!-- Stats Grid -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-teal-50 p-4 rounded-2xl border border-teal-100">
                                <p class="text-[9px] font-bold text-teal-600 uppercase tracking-widest">Total Token Gemini</p>
                                <h4 class="text-2xl font-black text-teal-800 mt-1" id="stat-total-gemini">0</h4>
                                <p class="text-[8px] text-teal-500 mt-1 font-mono" id="stat-gemini-detail">Prompt: 0 | Completion: 0</p>
                            </div>
                            <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <p class="text-[9px] font-bold text-blue-600 uppercase tracking-widest">WhatsApp Sent (Fonnte)</p>
                                <h4 class="text-2xl font-black text-blue-800 mt-1" id="stat-total-whatsapp">0</h4>
                                <p class="text-[8px] text-blue-500 mt-1">Total pesan terkirim otomatis</p>
                            </div>
                        </div>

                        <!-- Pricing Calculator -->
                        <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-wider">Kalkulator Tarif Tagihan</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-[9px] font-bold text-slate-400 uppercase">Tarif per 1K Token Gemini (Rp)</label>
                                    <input type="number" id="rate-gemini" value="200" class="w-full mt-1 bg-white border p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                                </div>
                                <div>
                                    <label class="text-[9px] font-bold text-slate-400 uppercase">Tarif per Pesan WA (Rp)</label>
                                    <input type="number" id="rate-whatsapp" value="100" class="w-full mt-1 bg-white border p-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                                </div>
                            </div>
                            <div class="pt-3 border-t flex justify-between items-center">
                                <p class="text-xs font-bold text-slate-700">Estimasi Total Tagihan Pemakaian:</p>
                                <p class="text-base font-black text-[#2845D6]" id="bill-total-estimate">Rp 0</p>
                            </div>
                        </div>

                        <!-- Breakdown Table -->
                        <div class="space-y-2">
                            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rincian per Fitur</h4>
                            <div class="border rounded-2xl overflow-hidden">
                                <table class="w-full text-left text-xs">
                                    <thead class="bg-slate-50 font-bold text-slate-500 uppercase text-[9px] border-b">
                                        <tr>
                                            <th class="p-3">Fitur</th>
                                            <th class="p-3 text-right">Panggilan</th>
                                            <th class="p-3 text-right">Token Gemini</th>
                                            <th class="p-3 text-right">WhatsApp Sent</th>
                                        </tr>
                                    </thead>
                                    <tbody id="usage-breakdown-body" class="font-semibold text-slate-700">
                                        <tr><td colspan="4" class="p-3 text-center text-slate-400 italic">Memuat rincian...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        if(window.lucide) window.lucide.createIcons();
    }

    attachEventListeners() {
        const modal = document.getElementById('manageAiModal');
        const form = document.getElementById('manageAiForm');
        const usageModal = document.getElementById('usageModal');
        
        if (!modal || !form || !usageModal) return;

        // Tutup modal Kelola AI
        document.getElementById('btn-close-ai-modal').addEventListener('click', () => modal.classList.add('hidden'));
        document.getElementById('btn-cancel-ai').addEventListener('click', () => modal.classList.add('hidden'));

        // Tutup modal Usage Report
        document.getElementById('btn-close-usage-modal').addEventListener('click', () => usageModal.classList.add('hidden'));

        // Buka modal saat klik "Kelola AI"
        this.container.querySelectorAll('.btn-manage-ai').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tr = e.currentTarget.closest('tr');
                const id = tr.dataset.id;
                const name = tr.dataset.name;
                const wa = tr.dataset.wa;
                const token = tr.dataset.token;
                const status = tr.dataset.status;

                document.getElementById('modal-client-title').innerText = `Kelola Asisten AI - ${name}`;
                document.getElementById('edit-dev-id').value = id;
                document.getElementById('edit-wa-number').value = wa;
                document.getElementById('edit-fonnte-token').value = token;
                document.getElementById('edit-status').value = status;

                modal.classList.remove('hidden');
            });
        });

        // Buka modal saat klik "Tagihan" (Laporan Pemakaian)
        this.container.querySelectorAll('.btn-view-usage').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tr = e.currentTarget.closest('tr');
                const id = tr.dataset.id;
                const name = tr.dataset.name;

                document.getElementById('modal-usage-title').innerText = `Laporan Pemakaian & Tagihan - ${name}`;
                usageModal.classList.remove('hidden');

                const breakdownBody = document.getElementById('usage-breakdown-body');
                breakdownBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-400 italic">Memuat rincian...</td></tr>`;

                try {
                    const res = await ApiService.get(`get_client_usage.php?developer_id=${id}`);
                    
                    if (res.status === 'success') {
                        const grandGemini = res.totals.grand_gemini;
                        const grandWhatsapp = res.totals.grand_whatsapp;
                        const grandPrompt = res.totals.grand_prompt;
                        const grandCompletion = res.totals.grand_completion;

                        document.getElementById('stat-total-gemini').innerText = grandGemini.toLocaleString('id-ID');
                        document.getElementById('stat-gemini-detail').innerText = `Prompt: ${grandPrompt.toLocaleString('id-ID')} | Completion: ${grandCompletion.toLocaleString('id-ID')}`;
                        document.getElementById('stat-total-whatsapp').innerText = grandWhatsapp.toLocaleString('id-ID');

                        // Fungsi hitung tagihan live
                        const calculateBill = () => {
                            const rateGemini = parseFloat(document.getElementById('rate-gemini').value) || 0;
                            const rateWhatsapp = parseFloat(document.getElementById('rate-whatsapp').value) || 0;
                            const billGemini = (grandGemini / 1000) * rateGemini;
                            const billWhatsapp = grandWhatsapp * rateWhatsapp;
                            const totalBill = billGemini + billWhatsapp;
                            document.getElementById('bill-total-estimate').innerText = `Rp ${Math.round(totalBill).toLocaleString('id-ID')}`;
                        };

                        // Pasang listener input
                        document.getElementById('rate-gemini').oninput = calculateBill;
                        document.getElementById('rate-whatsapp').oninput = calculateBill;
                        calculateBill(); // Hitung di awal

                        // Masukkan breakdown data ke tabel
                        if (res.breakdown.length === 0) {
                            breakdownBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-400 italic">Belum ada aktivitas pemakaian AI / WA.</td></tr>`;
                        } else {
                            breakdownBody.innerHTML = res.breakdown.map(b => `
                                <tr class="border-b last:border-0 hover:bg-slate-50/50">
                                    <td class="p-3 font-bold">${b.feature}</td>
                                    <td class="p-3 text-right">${parseInt(b.total_requests).toLocaleString('id-ID')}x</td>
                                    <td class="p-3 text-right font-mono">${parseInt(b.total_gemini || 0).toLocaleString('id-ID')}</td>
                                    <td class="p-3 text-right font-mono">${parseInt(b.total_whatsapp || 0).toLocaleString('id-ID')}</td>
                                </tr>
                            `).join('');
                        }
                    } else {
                        breakdownBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-red-500">Gagal mengambil data pemakaian dari server.</td></tr>`;
                    }
                } catch(err) {
                    breakdownBody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-red-500">Error: ${err.message}</td></tr>`;
                }
            });
        });

        // Submit form Kelola AI
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Menyimpan...';

            const devId = document.getElementById('edit-dev-id').value;
            const waNumber = document.getElementById('edit-wa-number').value;
            const fonnteToken = document.getElementById('edit-fonnte-token').value;
            const status = document.getElementById('edit-status').value;

            try {
                const response = await ApiService.post('update_developer_status.php', {
                    developer_id: devId,
                    status: status,
                    fonnte_token: fonnteToken,
                    wa_number: waNumber
                });

                alert(response.message || 'Konfigurasi CS AI berhasil disimpan!');
                modal.classList.add('hidden');
                await this.render(); // Muat ulang data
            } catch (error) {
                alert('Gagal: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Simpan';
            }
        });
    }
}