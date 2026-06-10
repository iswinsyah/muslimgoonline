import { ApiService } from '../api.js';

export class ClientManagementComponent {
    constructor(containerId) { this.container = document.getElementById(containerId); }
    
    async render() {
        if(!this.container) return;
        
        this.container.innerHTML = `<div class="p-10 text-center"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto text-slate-400"></i><p class="text-xs text-slate-400 mt-2 font-bold">Memuat data client...</p></div>`;
        if(window.lucide) window.lucide.createIcons();

        // Ambil data developer asli dari server
        let clients = [];
        try { clients = await ApiService.getDevelopers(); } catch(e) { console.error(e); }

        this.container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-8">
                <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-6 md:p-8 border-b bg-slate-50 flex justify-between items-center">
                        <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest italic">Developer Portfolio</h3>
                    </div>
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left min-w-[600px]">
                            <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <tr><th class="px-6 py-5">Developer Name</th><th class="px-6 py-5">Total Leads</th><th class="px-6 py-5">Conversion</th><th class="px-6 py-5">Status</th><th class="px-6 py-5">Action</th></tr>
                            </thead>
                            <tbody class="text-xs md:text-sm font-bold">
                                ${clients.map(c => `
                                <tr class="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-4 md:py-6 text-slate-700 whitespace-nowrap">${c.nama_perusahaan}</td>
                                    <td class="px-6 py-4 md:py-6 text-slate-500 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 md:py-6 text-slate-800 whitespace-nowrap">-</td>
                                    <td class="px-6 py-4 md:py-6 uppercase text-[10px] ${c.status_langganan === 'Active' ? 'text-green-600' : 'text-slate-400'} whitespace-nowrap">${c.status_langganan || 'Inactive'}</td>
                                    <td class="px-6 py-4 md:py-6 whitespace-nowrap"><button class="text-teal-600 text-[10px] md:text-xs font-black uppercase hover:underline">Detail</button></td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        if(window.lucide) window.lucide.createIcons();
    }
}