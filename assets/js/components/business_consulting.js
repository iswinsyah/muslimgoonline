import { ApiService } from '../api.js';

export class BusinessConsultingComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        this.learnings = [];
        this.developers = [];
        this.init();
    }

    async init() {
        if(!this.container) return;
        this.container.innerHTML = `<div class="p-10 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-teal-600"></i>
            <span>Memuat Dashboard Konsultasi Bisnis AI...</span>
        </div>`;
        if(window.lucide) window.lucide.createIcons();

        try {
            const adminId = this.state.currentUser.id;
            this.learnings = await ApiService.getGlobalLearnings(adminId);
            this.developers = await ApiService.getDevelopers();
            this.render();
        } catch (error) {
            this.container.innerHTML = `<div class="p-10 text-center text-red-500 font-bold">Gagal memuat data: ${error.message}</div>`;
        }
    }

    render() {
        if(!this.container) return;

        const totalCases = this.learnings.length;
        
        // Hitung statistik keberatan populer
        const objectionCounts = {};
        this.learnings.forEach(l => {
            const objText = (l.objections || '').toLowerCase();
            if (objText.includes('uang muka') || objText.includes('dp') || objText.includes('mahal') || objText.includes('biaya')) {
                objectionCounts['Harga / Uang Muka / DP'] = (objectionCounts['Harga / Uang Muka / DP'] || 0) + 1;
            } else if (objText.includes('lokasi') || objText.includes('akses') || objText.includes('jauh')) {
                objectionCounts['Lokasi & Aksesbilitas'] = (objectionCounts['Lokasi & Aksesbilitas'] || 0) + 1;
            } else if (objText.includes('legalitas') || objText.includes('sertifikat') || objText.includes('shm') || objText.includes('izin')) {
                objectionCounts['Legalitas / SHM / Izin'] = (objectionCounts['Legalitas / SHM / Izin'] || 0) + 1;
            } else if (objText.includes('tenor') || objText.includes('cicilan') || objText.includes('bunga') || objText.includes('syariah') || objText.includes('riba')) {
                objectionCounts['Skema Riba / Syariah / Tenor'] = (objectionCounts['Skema Riba / Syariah / Tenor'] || 0) + 1;
            } else {
                objectionCounts['Lain-lain / Ragu-ragu'] = (objectionCounts['Lain-lain / Ragu-ragu'] || 0) + 1;
            }
        });

        const topObjection = Object.entries(objectionCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Tidak Ada Data';

        this.container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-6">
                <!-- Header Banner -->
                <div class="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-8 opacity-10 hidden md:block"><i data-lucide="line-chart" class="w-24 h-24"></i></div>
                    <span class="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[9px] font-black uppercase tracking-wider mb-3">Hidden Business Suite</span>
                    <h3 class="text-xl md:text-2xl font-black mb-2 italic leading-tight uppercase tracking-tighter">AI Business Consulting Dashboard</h3>
                    <p class="text-[10px] md:text-xs opacity-75 font-medium italic max-w-lg">
                        "Sebagai Konsultan Marketing, gunakan data agregat sukses closing dari seluruh tenant untuk menyusun rekomendasi bisnis premium bagi klien Anda."
                    </p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200 text-center">
                        <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Total Taktik Sukses</p>
                        <p class="text-3xl font-black text-blue-900 tracking-tighter px-2 truncate">${totalCases} Kasus</p>
                        <p class="text-[9px] text-teal-600 font-bold mt-1 uppercase">Tersebar di ${this.developers.length} Tenant</p>
                    </div>
                    <div class="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200 text-center">
                        <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Keberatan Terbanyak</p>
                        <p class="text-xl font-black text-rose-600 tracking-tighter px-2 truncate mt-1">${topObjection}</p>
                        <p class="text-[9px] text-slate-500 font-bold mt-2 uppercase">Tren Pasar Nasional</p>
                    </div>
                    <div class="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200 text-center">
                        <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Estimasi Nilai Konsultasi</p>
                        <p class="text-2xl font-black text-amber-500 tracking-tighter px-2 truncate mt-1">Premium Report</p>
                        <p class="text-[9px] text-teal-600 font-bold mt-2 uppercase">Ready to Sell</p>
                    </div>
                </div>

                <!-- Consulting Report Generator Section -->
                <div class="bg-white p-6 md:p-10 rounded-[2rem] shadow-lg border border-blue-100 grid grid-cols-1 lg:grid-cols-5 gap-8 font-sans">
                    <div class="lg:col-span-2 space-y-4">
                        <div class="flex items-center mb-2">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 mr-4">
                                <i data-lucide="bot" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h4 class="font-black text-slate-800 text-sm uppercase tracking-widest leading-none">AI Consulting Report</h4>
                                <p class="text-[9px] text-slate-400 font-bold">Generate Laporan Bisnis</p>
                            </div>
                        </div>
                        <p class="text-[11px] leading-relaxed text-slate-500 font-medium italic">
                            Pilih tenant developer di bawah untuk membandingkan performa taktik mereka dengan data global, lalu biarkan AI merumuskan dokumen laporan konsultasi bisnis.
                        </p>
                        
                        <div class="space-y-1.5">
                            <label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Pilih Tenant Developer</label>
                            <select id="consulting-dev-select" class="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">-- Pilih Developer --</option>
                                ${this.developers.map(d => `<option value="${d.id}">${d.nama_perusahaan}</option>`).join('')}
                            </select>
                        </div>
                        
                        <button id="btn-generate-report" class="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 px-4 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all active:scale-95 flex justify-center items-center gap-1.5">
                            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                            <span>Hasilkan Laporan Konsultasi</span>
                        </button>
                    </div>

                    <!-- Report Result Display -->
                    <div class="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative flex flex-col min-h-[300px]">
                        <div class="flex items-center justify-between border-b pb-3 mb-4 shrink-0">
                            <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5"><i data-lucide="file-text" class="w-4 h-4 text-blue-900"></i> Laporan Konsultasi AI</p>
                            <button id="btn-copy-report" class="hidden px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 transition-all active:scale-95">
                                <i data-lucide="copy" class="w-3"></i>
                                <span>Salin Laporan</span>
                            </button>
                        </div>
                        <div id="report-output" class="text-xs text-slate-700 font-medium leading-relaxed overflow-y-auto max-h-[350px] custom-scrollbar italic text-center text-slate-400 py-10 select-text">
                            Pilih tenant dan klik tombol di samping untuk menghasilkan draf analisis bisnis premium.
                        </div>
                    </div>
                </div>

                <!-- Learning Database Table -->
                <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-6"><i data-lucide="database" class="w-4 h-4 text-indigo-600"></i> Database Obrolan Sukses & Taktik Tenant</p>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="bg-slate-50 text-slate-400 border-b border-slate-100">
                                    <th class="p-3 font-bold uppercase text-[9px]">Developer</th>
                                    <th class="p-3 font-bold uppercase text-[9px]">Pekerjaan & Segmen</th>
                                    <th class="p-3 font-bold uppercase text-[9px]">Keberatan Konsumen</th>
                                    <th class="p-3 font-bold uppercase text-[9px]">Taktik Closing Sukses</th>
                                    <th class="p-3 font-bold uppercase text-[9px]">Sampel Chat</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.learnings.length > 0 
                                  ? this.learnings.map(l => `
                                    <tr class="border-b border-slate-100 hover:bg-slate-50/50">
                                        <td class="p-3 font-bold text-slate-800">${l.nama_perusahaan || 'Global / Default'}</td>
                                        <td class="p-3 text-slate-600 font-medium">${l.buyer_job}<br><span class="text-[10px] text-teal-600 font-bold">${l.property_segment}</span></td>
                                        <td class="p-3 text-rose-600 font-medium max-w-xs truncate" title="${l.objections}">${l.objections}</td>
                                        <td class="p-3 text-slate-700 font-medium max-w-xs truncate" title="${l.successful_tactics}">${l.successful_tactics}</td>
                                        <td class="p-3 font-mono text-[10px] text-slate-400 max-w-xs truncate" title="${l.chat_snippet}">${l.chat_snippet}</td>
                                    </tr>
                                  `).join('')
                                  : `<tr><td colspan="5" class="p-8 text-center text-slate-400">Belum ada memori sales closing yang terekam.</td></tr>`
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.container.querySelector('#btn-generate-report').addEventListener('click', () => this.generateReport());

        const copyBtn = this.container.querySelector('#btn-copy-report');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = this.container.querySelector('#report-output').innerText;
                navigator.clipboard.writeText(text);
                const orig = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-green-600"></i><span class="text-green-600">Tersalin!</span>`;
                if(window.lucide) window.lucide.createIcons();
                setTimeout(() => {
                    copyBtn.innerHTML = orig;
                    if(window.lucide) window.lucide.createIcons();
                }, 2000);
            });
        }

        if(window.lucide) window.lucide.createIcons();
    }

    async generateReport() {
        const devSelect = this.container.querySelector('#consulting-dev-select');
        const devId = devSelect.value;
        if (!devId) return alert('Pilih tenant developer-nya dulu bos!');

        const devName = devSelect.options[devSelect.selectedIndex].text;
        const output = this.container.querySelector('#report-output');
        const btn = this.container.querySelector('#btn-generate-report');
        const copyBtn = this.container.querySelector('#btn-copy-report');

        const origHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Menyusun...`;
        output.innerHTML = `<div class="p-10 text-center text-slate-500 flex flex-col items-center justify-center gap-3 h-full">
            <i data-lucide="loader-2" class="w-6 h-6 animate-spin text-blue-900"></i>
            <span>Sedang menganalisis komparasi taktik sales global & lokal untuk menyusun laporan premium...</span>
        </div>`;
        if (window.lucide) window.lucide.createIcons();

        try {
            // Filter local vs global learnings
            const localLearnings = this.learnings.filter(l => l.developer_id == devId);
            const globalLearnings = this.learnings.filter(l => l.developer_id != devId);

            let localDataText = localLearnings.length > 0
                ? localLearnings.map(l => `- Pekerjaan: ${l.buyer_job}, Segmen: ${l.property_segment}\n  * Keberatan: ${l.objections}\n  * Taktik Closing Sukses: ${l.successful_tactics}`).join("\n")
                : "- Belum ada data transaksi closing terekam dari tenant ini.";

            let globalDataText = globalLearnings.length > 0
                ? globalLearnings.map(l => `- Pekerjaan: ${l.buyer_job}, Segmen: ${l.property_segment}\n  * Keberatan: ${l.objections}\n  * Taktik Closing Sukses: ${l.successful_tactics}`).join("\n")
                : "- Belum ada data komparatif global dari tenant lainnya.";

            const prompt = `Sebagai Konsultan Bisnis & Marketing Properti Syariah Senior, buatlah sebuah Laporan Konsultasi Bisnis Premium untuk Developer (Tenant) bernama "${devName}".

Data Pembelajaran Sukses Lokal (di Developer ini):
${localDataText}

Data Pembelajaran Sukses Global (Seluruh Tenant di Sistem):
${globalDataText}

Tugas Anda:
1. Analisis perbandingan kinerja lokal developer vs data global.
2. Identifikasi keberatan (objections) paling umum yang dialami developer ini dibandingkan tren pasar global.
3. Berikan rekomendasi taktis spesifik untuk meningkatkan tingkat closing di developer ini (minimal 4 rekomendasi taktis).
4. Buatkan ringkasan eksekutif yang memukau bagi pimpinan perusahaan untuk meyakinkan mereka mengambil keputusan perbaikan taktik sales.

Format output WAJIB berupa teks Markdown Indonesia yang profesional, rapi, terperinci, dan mudah dibaca oleh pemilik bisnis properti. Jangan membungkus dengan tag markdown json. Tulis langsung sebagai markdown format laporan resmi.
`;

            const response = await ApiService.generateAIContent(prompt);
            let resultText = response.result || 'Gagal membuat laporan.';
            
            // Render markdown to HTML (simple conversion for preview)
            let htmlText = resultText
                .replace(/^### (.*$)/gim, '<h6 class="font-bold text-sm text-slate-800 mt-4 mb-2 uppercase">$1</h6>')
                .replace(/^## (.*$)/gim, '<h5 class="font-black text-base text-blue-900 mt-6 mb-3 uppercase border-b pb-1">$1</h5>')
                .replace(/^# (.*$)/gim, '<h4 class="font-black text-lg text-blue-900 mt-6 mb-4 border-b-2 pb-2 uppercase">$1</h4>')
                .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-700">$1</li>')
                .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700">$1</li>')
                .replace(/\n/g, '<br>');

            output.innerHTML = `<div class="text-left space-y-2 whitespace-pre-wrap font-sans text-[11px] leading-relaxed select-text">${htmlText}</div>`;
            copyBtn.classList.remove('hidden');
        } catch (error) {
            output.innerHTML = `<div class="p-6 text-red-500 font-bold text-center">Gagal menyusun laporan: ${error.message}</div>`;
            copyBtn.classList.add('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = origHTML;
            if (window.lucide) window.lucide.createIcons();
        }
    }
}
