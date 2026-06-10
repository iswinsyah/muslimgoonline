export class ReportingComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
    }

    render() {
        if (!this.container) return;

        // Simulasi Data Reporting
        const stats = {
            totalLeads: this.state.leads.length,
            conversion: 12.5,
            revenue: "1.2M",
            target: "2M"
        };

        this.container.innerHTML = `
            <div class="max-w-5xl mx-auto space-y-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="font-black text-slate-800 text-xl uppercase tracking-widest">Executive Reporting</h3>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Analisis Kinerja Tim Sales</p>
                    </div>
                    <button class="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center shadow-sm">
                        <i data-lucide="download" class="w-4 h-4 mr-2"></i> Export PDF
                    </button>
                </div>

                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-teal-900 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-4 opacity-10"><i data-lucide="trending-up" class="w-24 h-24"></i></div>
                        <p class="text-[10px] font-bold text-teal-300 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h4 class="text-3xl font-black tracking-tighter">Rp ${stats.revenue}</h4>
                        <div class="mt-4 w-full bg-teal-800 rounded-full h-1.5">
                            <div class="bg-teal-400 h-1.5 rounded-full" style="width: 60%"></div>
                        </div>
                        <p class="text-[9px] mt-2 text-teal-200">60% dari Target Rp ${stats.target}</p>
                    </div>

                    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversion Rate</p>
                        <h4 class="text-3xl font-black text-slate-800 tracking-tighter">${stats.conversion}%</h4>
                        <p class="text-[9px] mt-2 text-green-600 font-bold flex items-center"><i data-lucide="arrow-up-right" class="w-3 h-3 mr-1"></i> +2.4% bulan ini</p>
                    </div>

                    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Leads</p>
                        <h4 class="text-3xl font-black text-slate-800 tracking-tighter">${stats.totalLeads}</h4>
                        <p class="text-[9px] mt-2 text-slate-400">Prospek sedang diproses</p>
                    </div>
                </div>

                <!-- Team Performance Table (Dummy) -->
                <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div class="p-6 border-b border-slate-100">
                        <h4 class="font-black text-slate-800 text-sm uppercase tracking-widest">Top Sales Performance</h4>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-[10px] uppercase font-bold text-slate-600">
                            <thead class="bg-slate-50 text-slate-400 border-b border-slate-100">
                                <tr><th class="p-4">Sales Name</th><th class="p-4">Leads</th><th class="p-4">Closing</th><th class="p-4">Omzet</th></tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr class="hover:bg-slate-50"><td class="p-4 text-slate-800">Budi Santoso</td><td class="p-4">45</td><td class="p-4 text-green-600">5</td><td class="p-4">Rp 250jt</td></tr>
                                <tr class="hover:bg-slate-50"><td class="p-4 text-slate-800">Siti Aminah</td><td class="p-4">32</td><td class="p-4 text-green-600">3</td><td class="p-4">Rp 150jt</td></tr>
                                <tr class="hover:bg-slate-50"><td class="p-4 text-slate-800">Rudi Hartono</td><td class="p-4">28</td><td class="p-4 text-green-600">2</td><td class="p-4">Rp 100jt</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        if (window.lucide) window.lucide.createIcons();
    }
}