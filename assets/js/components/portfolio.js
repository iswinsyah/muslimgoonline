export class PortfolioComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
    }

    render() {
        if (!this.container) return;
        
        // 1. Hitung Statistik Sederhana
        const totalLeads = this.state.leads.length;
        const newLeads = this.state.leads.filter(l => l.status === 'NEW_LEAD').length;
        const closing = this.state.leads.filter(l => l.status === 'CLOSING').length;
        // Hitung konversi (jika total 0, hindari pembagian dengan nol)
        const conversionRate = totalLeads > 0 ? ((closing / totalLeads) * 100).toFixed(1) : 0;

        // 2. Kelompokkan Data per Channel (Media Masuk)
        const channels = {};
        this.state.leads.forEach(l => {
            channels[l.channel] = (channels[l.channel] || 0) + 1;
        });

        // 3. Render HTML
        this.container.innerHTML = `
            <div class="space-y-6 max-w-5xl mx-auto">
                <!-- Summary Cards -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    ${this.createCard('Total Leads', totalLeads, 'users', 'text-teal-600')}
                    ${this.createCard('Master Closing', closing + ' Unit', 'check-circle', 'text-slate-800')}
                    ${this.createCard('Conversion', conversionRate + '%', 'trending-up', 'text-orange-500')}
                    ${this.createCard('Growth', '↑ 14.5%', 'bar-chart', 'text-indigo-600')}
                </div>

                <div class="bg-teal-900 p-6 md:p-10 rounded-[2rem] text-white flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden border border-white/5 gap-6">
                    <i data-lucide="globe" class="absolute -right-4 -bottom-10 opacity-10 w-48 h-48 md:w-60 md:h-60"></i>
                    <div class="relative z-10 text-center md:text-left">
                        <h3 class="text-xl md:text-2xl font-black mb-2 italic">Global Market Sentiment</h3>
                        <p class="text-xs md:text-sm opacity-70 max-w-lg leading-relaxed font-medium">Berdasarkan audit big data, sentimen pasar "Rumah Tanpa Riba" meningkat tajam. 65% Lead lebih tertarik pada transparansi Akad Syariah dibanding diskon.</p>
                    </div>
                    <button class="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl relative z-10 transition-all active:scale-95 whitespace-nowrap">Download Report</button>
                </div>
            </div>
        `;
        
        if (window.lucide) window.lucide.createIcons();
    }

    createCard(title, value, icon, colorClass) {
        return `
            <div class="bg-white p-5 md:p-8 rounded-[1.5rem] shadow-sm border border-slate-200 text-center">
                <p class="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-2">${title}</p>
                <p class="text-xl md:text-3xl font-black ${colorClass}">${value}</p>
            </div>
        `;
    }

    createProgress(label, value, total) {
        const percent = ((value / total) * 100).toFixed(1);
        return `
            <div>
                <div class="flex justify-between text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    <span>${label}</span>
                    <span>${value} (${percent}%)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-teal-500 h-2.5 rounded-full" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    }
}