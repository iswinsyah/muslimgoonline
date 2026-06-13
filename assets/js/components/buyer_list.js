import { ApiService } from '../api.js';
import { UI } from '../ui.js';
import { maskInfo } from '../helpers.js';

export class BuyerListComponent {
    constructor(elementId, state) {
        this.container = document.getElementById(elementId);
        this.ui = new UI();
        this.state = state;
    }

    async render() {
        this.container.innerHTML = this.ui.renderLoading('Memuat akumulasi data buyer...');
        try {
            // getLeads di API sudah otomatis mengisolasi data berdasarkan role 
            // (Developer akan melihat semua data milik perusahaannya)
            const leads = await ApiService.getLeads(this.state.currentUser.id, this.state.currentUser.role);
            
            this.container.innerHTML = `
                <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in">
                    <div class="p-6 md:p-8 border-b bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 class="text-lg font-black text-slate-800 uppercase tracking-widest italic">Daftar Akumulasi Buyer</h3>
                            <p class="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider italic">Monitoring Data Seluruh Agent & CS</p>
                        </div>
                        <div class="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                            Total: ${leads.length} Data
                        </div>
                    </div>
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <tr>
                                    <th class="p-4">Nama Buyer / NIK</th>
                                    <th class="p-4">WhatsApp</th>
                                    <th class="p-4">Status</th>
                                    <th class="p-4">Ditangani Oleh</th>
                                    <th class="p-4">Tgl Masuk</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-xs">
                                ${leads.length === 0 ? '<tr><td colspan="5" class="p-10 text-center text-slate-400 italic">Belum ada data buyer.</td></tr>' : leads.map(l => `
                                    <tr class="hover:bg-slate-50/80 transition-colors cursor-pointer" onclick="document.dispatchEvent(new CustomEvent('lead-selected', { detail: ${JSON.stringify(l).replace(/"/g, '&quot;')} }))">
                                        <td class="p-4">
                                            <p class="font-bold text-slate-800">${l.name}</p>
                                            <p class="text-[9px] text-slate-400 font-mono">${l.nik || '-'}</p>
                                        </td>
                                        <td class="p-4 font-bold text-slate-600">${maskInfo(l.phone, l.owner, this.state.currentUser.role, 'phone')}</td>
                                        <td class="p-4">
                                            <span class="px-2 py-1 bg-teal-50 text-teal-700 rounded text-[9px] font-black uppercase">${l.status.replace('_', ' ')}</span>
                                        </td>
                                        <td class="p-4 font-bold text-blue-600">
                                            <div class="flex items-center">
                                                <i data-lucide="user-check" class="w-3 h-3 mr-1.5 opacity-50"></i>
                                                ${l.owner_name || 'Admin'}
                                            </div>
                                        </td>
                                        <td class="p-4 text-slate-400 text-[10px] italic">${new Date(l.created_at).toLocaleDateString('id-ID')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        } catch (error) {
            this.container.innerHTML = this.ui.renderError('Gagal memuat daftar buyer.');
        }
    }
}