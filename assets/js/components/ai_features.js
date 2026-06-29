import { ApiService } from '../api.js';
import { formatWhatsAppNumber } from '../helpers.js';

/**
 * Kumpulan Komponen AI & Fitur Canggih
 */

// 1. LEAD ANALYZER
export class LeadAnalyzerComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
    }
    render() {
        if(!this.container) return;

        const leads = this.state && this.state.leads ? this.state.leads : [];
        const leadOptions = leads.map(lead => {
            const detailText = [
                lead.phone ? lead.phone : '',
                lead.job ? lead.job : ''
            ].filter(Boolean).join(' - ');
            return `<option value="${lead.id}">${lead.name} ${detailText ? `(${detailText})` : ''}</option>`;
        }).join('');

        this.container.innerHTML = `
            <div class="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in">
                <!-- Edukasi AI Banner -->
                <div class="bg-teal-900 rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                    <div class="absolute top-0 right-0 p-8 opacity-10 hidden md:block"><i data-lucide="shield-check" class="w-20 h-20"></i></div>
                    <div class="w-12 h-12 rounded-full bg-teal-800 flex items-center justify-center shrink-0">
                        <i data-lucide="sparkles" class="w-6 h-6 text-orange-400 font-black animate-pulse"></i>
                    </div>
                    <div>
                        <h4 class="font-black text-white text-xs uppercase tracking-widest leading-none mb-1">Edukasi Agen & CS - Analisa Tajam AI</h4>
                        <p class="text-[10px] md:text-xs text-teal-100 leading-relaxed font-medium">
                            "Dapatkan analisa lebih tajam dengan input nomor whatsapp lead. AI membutuhkan nomor WhatsApp prospek agar dapat mensinkronkan data profil dari pipeline, membedah gaya hidup dan kemampuan finansial mereka secara 100% presisi. Jika nomor WhatsApp kosong, Anda hanya bisa menikmati analisa percakapan cepat saja."
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <!-- Mode A: Analisa Percakapan Chat -->
                    <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-between">
                        <div class="space-y-4">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                    <i data-lucide="message-square" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <h4 class="font-black text-slate-800 text-xs uppercase tracking-wider leading-none">Mode A: Analisa Percakapan Chat</h4>
                                    <p class="text-[9px] text-slate-400 font-bold">Tanpa Nomor WhatsApp</p>
                                </div>
                            </div>
                            <p class="text-[10px] text-slate-500 font-medium leading-relaxed italic border-l-2 pl-3 border-orange-200">
                                Analisis gaya bicara prospek murni berdasarkan salinan percakapan WhatsApp. Mode ini tidak mensinkronkan data profil pipeline.
                            </p>
                            
                            <div class="space-y-1">
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Salinan Percakapan Obrolan (Wajib)</label>
                                <textarea id="analyzer-input-chat" placeholder="Tempel salinan chat WhatsApp calon konsumen di sini..." class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium h-32 md:h-40 outline-none focus:ring-2 focus:ring-orange-500 resize-none shadow-inner custom-scrollbar transition-all"></textarea>
                            </div>
                        </div>

                        <button id="btn-analyze-chat" class="w-full mt-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg hover:shadow-orange-600/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="message-square" class="w-4 h-4"></i>
                            <span>Mulai Analisa Obrolan</span>
                        </button>
                    </div>

                    <!-- Mode B: Analisa WhatsApp Proaktif -->
                    <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col justify-between">
                        <div class="space-y-4">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                    <i data-lucide="phone-call" class="w-5 h-5 animate-pulse"></i>
                                </div>
                                <div>
                                    <h4 class="font-black text-slate-800 text-xs uppercase tracking-wider leading-none">Mode B: Analisa WhatsApp Proaktif</h4>
                                    <p class="text-[9px] text-teal-600 font-bold">Sinkronisasi Database Prospek</p>
                                </div>
                            </div>
                            <p class="text-[10px] text-slate-500 font-medium leading-relaxed italic border-l-2 pl-3 border-teal-200">
                                **WAJIB NOMOR WHATSAPP**. AI akan melacak data prospek di pipeline (nama, pekerjaan, segmen rumah) untuk membedah psikologi, gaya hidup, kemampuan finansial, dan merancang kata sapaan pertama.
                            </p>
                            
                            <div class="space-y-1">
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Pilih Prospek dari Pipeline</label>
                                <select id="analyzer-lead-select" class="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                                    <option value="">--- Pilih Prospek ---</option>
                                    ${leadOptions}
                                </select>
                            </div>

                            <div class="space-y-1">
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Atau Ketik Nomor WhatsApp Manual (Wajib)</label>
                                <input type="text" id="analyzer-phone" placeholder="Contoh: 08123456789 atau +628..." class="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all">
                            </div>
                        </div>

                        <button id="btn-analyze-profile" class="w-full mt-6 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-xs uppercase shadow-lg hover:shadow-teal-600/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="phone-call" class="w-4 h-4"></i>
                            <span>Mulai Analisa WhatsApp</span>
                        </button>
                    </div>
                </div>
                
                <!-- Container Hasil -->
                <div id="analyzer-result" class="hidden"></div>
            </div>
        `;

        const selectEl = this.container.querySelector('#analyzer-lead-select');
        const phoneInput = this.container.querySelector('#analyzer-phone');
        
        selectEl.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            if (selectedId) {
                const lead = leads.find(l => l.id == selectedId);
                if (lead && lead.phone) {
                    phoneInput.value = lead.phone;
                } else {
                    phoneInput.value = '';
                }
            } else {
                phoneInput.value = '';
            }
        });

        this.container.querySelector('#btn-analyze-chat').addEventListener('click', () => this.analyzeChat());
        this.container.querySelector('#btn-analyze-profile').addEventListener('click', () => this.analyzeProfile());

        if(window.lucide) window.lucide.createIcons();
    }

    async analyzeChat() {
        const btn = this.container.querySelector('#btn-analyze-chat');
        const res = this.container.querySelector('#analyzer-result');
        const input = this.container.querySelector('#analyzer-input-chat').value.trim();

        if (!input) return alert('Masukkan salinan chat WhatsApp terlebih dahulu, Bos!');

        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Menganalisa...</span>`;
        btn.disabled = true;
        res.classList.add('hidden');
        if (window.lucide) window.lucide.createIcons();

        try {
            const prompt = `Analisa prospek properti berikut murni berdasarkan percakapan chat saja.

Percakapan Chat:
"${input}"

Tugas Anda:
1. Tentukan tingkat "Suhu Prospek" (dalam persentase 0-100%).
2. Berikan Label (HOT LEAD / WARM LEAD / COLD LEAD).
3. Analisis Profil Kepribadian & Gaya Hidup prospek tersebut berdasarkan cara bicaranya di chat (maksimal 2 kalimat).
4. Analisis Estimasi Kemampuan Finansial prospek secara logis berdasarkan petunjuk di chat (maksimal 2 kalimat).
5. Berikan 3 poin penting Saran Taktik Closing yang spesifik untuk menghadapi kepribadian dan kondisi finansial prospek ini.
6. Buatkan 1 Draf Pesan Balasan WhatsApp (Syariah) yang sangat persuasif, bersahabat, santun, dan siap dikirimkan untuk merespons chat terakhir prospek tersebut.

Format output WAJIB berupa JSON murni dengan key sebagai berikut (tanpa pembungkus markdown \`\`\`json):
{
  "score": "Persentase (contoh: 80%)",
  "label": "HOT LEAD / WARM LEAD / COLD LEAD",
  "personality": "Analisis kepribadian...",
  "financial": "Estimasi kemampuan finansial...",
  "closing_tactics": [
    "Poin taktik closing 1",
    "Poin taktik closing 2",
    "Poin taktik closing 3"
  ],
  "draft_reply": "Draf pesan balasan WhatsApp syariah yang persuasif..."
}
`;
            const response = await ApiService.generateAIContent(prompt);
            let cleanJson = (response.result || '').replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanJson);

            this.displayResult(data, null, input);
        } catch (error) {
            res.innerHTML = `<div class="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs"><strong class="font-bold">Gagal Analisa AI:</strong><br>${error.message}</div>`;
            res.classList.remove('hidden');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    async analyzeProfile() {
        const btn = this.container.querySelector('#btn-analyze-profile');
        const res = this.container.querySelector('#analyzer-result');
        const phone = this.container.querySelector('#analyzer-phone').value.trim();
        const selectedLeadId = this.container.querySelector('#analyzer-lead-select').value;
        const leads = this.state && this.state.leads ? this.state.leads : [];

        if (!phone) return alert('Nomor WhatsApp wajib diisi untuk melakukan Analisa WhatsApp Proaktif!');

        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Menganalisa...</span>`;
        btn.disabled = true;
        res.classList.add('hidden');
        if (window.lucide) window.lucide.createIcons();

        // Cari lead yang cocok berdasarkan nomor telepon terformat
        const normalizedInputPhone = formatWhatsAppNumber(phone);
        let lead = null;
        if (selectedLeadId) {
            lead = leads.find(l => l.id == selectedLeadId);
        } else {
            lead = leads.find(l => formatWhatsAppNumber(l.phone) === normalizedInputPhone);
        }

        // JIKA LEAD TIDAK DITEMUKAN DI PIPELINE -> "PEMAKSAAN HALUS" (Tampilkan Peringatan Edukasi)
        if (!lead) {
            res.innerHTML = `
                <div class="p-8 bg-amber-50 border border-amber-200 rounded-[2rem] text-center max-w-2xl mx-auto space-y-4 shadow-sm animate-in font-sans">
                    <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto">
                        <i data-lucide="alert-circle" class="w-6 h-6"></i>
                    </div>
                    <h4 class="font-black text-slate-800 uppercase tracking-widest text-xs leading-none">Nomor WhatsApp Belum Terdaftar!</h4>
                    <p class="text-xs text-slate-600 font-medium leading-relaxed">
                        Nomor WhatsApp <strong>${phone}</strong> belum terdaftar di menu **Lead & Pipeline** milik Anda. 
                    </p>
                    <p class="text-[11px] text-slate-500 leading-relaxed max-w-md mx-auto italic">
                        Untuk menikmati analisa kepribadian, gaya hidup, dan kemampuan finansial yang super tajam, silakan daftarkan prospek ini terlebih dahulu di pipeline Anda!
                    </p>
                </div>
            `;
            res.classList.remove('hidden');
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        try {
            // Ambil memori sukses terdekat (jika ada developer_id)
            let pastLearningsContext = "";
            const devId = this.state.currentUser.developer_id;
            if (devId) {
                try {
                    const learnings = await ApiService.getLearnings(devId);
                    if (learnings && learnings.length > 0) {
                        pastLearningsContext = "\nFORMULA & TAKTIK SUKSES CLOSING YANG TERBUKTI DI PERUSAHAAN ANDA:\n";
                        learnings.forEach((item, index) => {
                            pastLearningsContext += `${index + 1}. Pekerjaan Pembeli=${item.buyer_job}, Segmen Terbeli=${item.property_segment}\n   - Analisis Karakter: ${item.objections}\n   - Taktik Closing Sukses: ${item.successful_tactics}\n`;
                        });
                        pastLearningsContext += "\nCATATAN AI: Prioritaskan menggunakan dan mengadaptasi taktik sukses di atas jika kondisi/karakter prospek saat ini mirip!\n";
                    }
                } catch (e) {
                    console.warn("Gagal memuat memori sukses AI:", e);
                }
            }

            const prompt = `Sebagai konsultan properti syariah ahli, lakukan Analisis WhatsApp Proaktif mendalam untuk prospek berikut dengan mensinkronkan profil data pipeline dan formula sukses closing terdahulu di perusahaan Anda.

Informasi Profil Prospek (Sinkronisasi Pipeline):
- Nama: ${lead.name}
- Pekerjaan: ${lead.job || 'Tidak diisi'}
- Segmen Prospek: ${lead.segment || 'Tidak diisi'}
- Media Masuk: ${lead.channel || 'Tidak diisi'}
- Status Pipeline: ${lead.status || 'Tidak diisi'}
- WhatsApp: ${formatWhatsAppNumber(lead.phone)}

${pastLearningsContext ? pastLearningsContext + "\n" : ""}

Tugas Anda:
1. Petakan tingkat "Suhu Prospek" awal berdasarkan data profil pekerjaannya (dalam persentase 0-100%).
2. Berikan Label awal (HOT LEAD / WARM LEAD / COLD LEAD).
3. Bedah Profil Kepribadian & Gaya Hidup prospek ini secara tajam berdasarkan latar belakang profesi dan segmen rumah yang diminati (maksimal 2 kalimat).
4. Bedah Estimasi Kemampuan Finansial & Daya Beli riil prospek berdasarkan pekerjaan dan segmen rumahnya (maksimal 2 kalimat).
5. Berikan 3 poin penting Saran Taktik Pendekatan/Closing awal khusus untuk segmen dan pekerjaan prospek ini agar tingkat closing tinggi.
6. Buatkan 1 Draf Pesan Sapaan WhatsApp Pertama (Syariah) yang sangat personal, menyapa nama prospek, santun, bersahabat, dan siap dikirimkan untuk membuka obrolan.

Format output WAJIB berupa JSON murni dengan key sebagai berikut (tanpa pembungkus markdown \`\`\`json):
{
  "score": "Persentase (contoh: 85%)",
  "label": "HOT LEAD / WARM LEAD / COLD LEAD",
  "personality": "Bedah kepribadian & gaya hidup tajam...",
  "financial": "Analisis finansial & daya beli...",
  "closing_tactics": [
    "Taktik pendekatan 1",
    "Taktik pendekatan 2",
    "Taktik pendekatan 3"
  ],
  "draft_reply": "Draf pesan sapaan pertama WhatsApp syariah..."
}
`;
            const response = await ApiService.generateAIContent(prompt);
            let cleanJson = (response.result || '').replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanJson);

            this.displayResult(data, lead, '');
        } catch (error) {
            res.innerHTML = `<div class="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs"><strong class="font-bold">Gagal Analisa AI:</strong><br>${error.message}</div>`;
            res.classList.remove('hidden');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    displayResult(data, lead, inputChatSnippet) {
        const res = this.container.querySelector('#analyzer-result');
        
        res.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Kolom 1: Skor & Info Dasar -->
                <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between text-center relative overflow-hidden">
                    <div class="absolute -top-10 -right-10 w-24 h-24 bg-teal-50 rounded-full -z-10"></div>
                    <div>
                        <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Suhu Prospek</p>
                        <p class="text-5xl font-black text-teal-600 mt-4">${data.score || 'N/A'}</p>
                        <span class="inline-block mt-3 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[9px] font-black uppercase tracking-wider">${data.label || 'ANALYSIS'}</span>
                    </div>
                    <div class="mt-6 border-t pt-6 text-left space-y-4 font-sans">
                        <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-teal-600"></i> Kepribadian & Gaya Hidup</p>
                            <p class="text-xs text-slate-600 font-medium mt-1 leading-relaxed">${data.personality || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><i data-lucide="wallet" class="w-3.5 h-3.5 text-teal-600"></i> Kemampuan Finansial</p>
                            <p class="text-xs text-slate-600 font-medium mt-1 leading-relaxed">${data.financial || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <!-- Kolom 2: Taktik Closing -->
                <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm md:col-span-2 flex flex-col justify-between font-sans">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><i data-lucide="shield-check" class="w-4 h-4 text-teal-600"></i> Taktik Closing Yang Disarankan AI</p>
                        <ul class="mt-4 space-y-3">
                            ${Array.isArray(data.closing_tactics) && data.closing_tactics.length > 0 
                              ? data.closing_tactics.map(tactic => `
                                <li class="flex items-start gap-3 text-xs text-slate-700 font-medium leading-relaxed">
                                    <i data-lucide="check-circle" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                                    <span>${tactic}</span>
                                </li>
                              `).join('')
                              : `<li class="flex items-start gap-3 text-xs text-slate-700 font-medium leading-relaxed">
                                    <i data-lucide="check-circle" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                                    <span>Tawarkan penjelasan unit syariah secara bertahap dan ramah.</span>
                                 </li>`
                            }
                        </ul>
                    </div>
                    <div class="mt-6 border-t pt-6 bg-slate-50 -mx-6 md:-mx-8 p-6 md:p-8 -mb-6 md:-mb-8 rounded-b-[2rem]">
                        <div class="flex items-center justify-between">
                            <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5"><i data-lucide="message-square" class="w-4 h-4 text-orange-600"></i> Draf Balasan Chat (Syariah)</p>
                            <div class="flex items-center gap-2">
                                <button id="btn-save-learning" class="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 transition-all active:scale-95" title="Simpan pola sukses ini ke AI Brain untuk pembelajaran bersama">
                                    <i data-lucide="brain" class="w-3.5 h-3.5"></i>
                                    <span>Simpan Taktik Sukses</span>
                                </button>
                                <button id="btn-copy-draft" class="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 transition-all active:scale-95">
                                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                                    <span>Salin Draf</span>
                                </button>
                            </div>
                        </div>
                        <div class="mt-3 bg-white border border-slate-200 p-4 rounded-xl text-xs text-slate-700 font-medium leading-relaxed italic whitespace-pre-wrap">"${data.draft_reply || 'Tidak ada draf pesan.'}"</div>
                    </div>
                </div>
            </div>
        `;
        res.classList.remove('hidden');

        // Attach copy action listener
        const copyBtn = res.querySelector('#btn-copy-draft');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(data.draft_reply || '');
                const originalBtnContent = copyBtn.innerHTML;
                copyBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-green-600"></i><span class="text-green-600">Tersalin!</span>`;
                if (window.lucide) window.lucide.createIcons();
                setTimeout(() => {
                    copyBtn.innerHTML = originalBtnContent;
                    if (window.lucide) window.lucide.createIcons();
                }, 2000);
            });
        }

        // Attach save learning action listener
        const saveLearningBtn = res.querySelector('#btn-save-learning');
        if (saveLearningBtn) {
            saveLearningBtn.addEventListener('click', async () => {
                try {
                    const learningData = {
                        lead_id: lead ? lead.id : null,
                        buyer_job: lead ? (lead.job || 'Unknown') : 'Unknown',
                        property_segment: lead ? (lead.segment || 'Unknown') : 'Unknown',
                        objections: data.personality || 'Unknown',
                        successful_tactics: Array.isArray(data.closing_tactics) ? data.closing_tactics.join("\n") : (data.advice || ''),
                        chat_snippet: inputChatSnippet || 'Analisis Proaktif Profil (Tanpa Chat)'
                    };
                    saveLearningBtn.disabled = true;
                    saveLearningBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin mr-1"></i><span>Menyimpan...</span>`;
                    if (window.lucide) window.lucide.createIcons();

                    await ApiService.saveLearning(learningData, this.state.currentUser.id);
                    
                    saveLearningBtn.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-green-600 mr-1"></i><span class="text-green-600">AI Brain Cerdas!</span>`;
                    if (window.lucide) window.lucide.createIcons();
                } catch (err) {
                    alert("Gagal menyimpan ke AI Brain: " + err.message);
                    saveLearningBtn.disabled = false;
                    saveLearningBtn.innerHTML = `<i data-lucide="brain" class="w-3.5 h-3.5 mr-1"></i><span>Simpan Taktik Sukses</span>`;
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        }

        if(window.lucide) window.lucide.createIcons();
    }
}

// 2. CREATIVE SUITE (AI SOCIAL MEDIA KIT)
export class CreativeSuiteComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        this.activeTab = 'carousel'; // 'carousel', 'video', 'copywriting'
        this.currentSlide = 1;
        this.currentTheme = 'teal'; // 'teal', 'gold', 'dark'
        this.selectedImage = 'default';
        this.kitResult = null;
    }

    render() {
        if (!this.container) return;

        // Cek apakah ada hasil harian dari cron job untuk hari ini
        const todaysContentStr = this.state.developerSettings?.ai_todays_content;
        let todaysContent = null;
        const todayDateStr = new Date().toISOString().split('T')[0];

        if (todaysContentStr) {
            try {
                const parsed = typeof todaysContentStr === 'string' ? JSON.parse(todaysContentStr) : todaysContentStr;
                if (parsed.date === todayDateStr) {
                    todaysContent = parsed;
                    if (!this.kitResult) {
                        this.kitResult = parsed.kit;
                    }
                }
            } catch (e) {
                console.error("Gagal memuat konten harian:", e);
            }
        }

        // Hitung topik hari ini langsung dari Kalender Konten jika belum ada data todaysContent
        let calendarTopic = '';
        const calendarStr = this.state.developerSettings?.ai_content_calendar;
        const startedAt = this.state.developerSettings?.calendar_started_at;

        if (calendarStr) {
            try {
                const calendar = typeof calendarStr === 'string' ? JSON.parse(calendarStr) : calendarStr;
                if (Array.isArray(calendar) && calendar.length > 0) {
                    const startTs = (startedAt && typeof startedAt === 'string') ? new Date(startedAt.replace(' ', 'T')).getTime() : Date.now();
                    const diffMs = Date.now() - startTs;
                    let dayIndex = Math.floor(diffMs / 86400000) + 1;
                    if (dayIndex <= 0) dayIndex = 1;
                    
                    // Modulus siklus hari kalender
                    dayIndex = ((dayIndex - 1) % calendar.length) + 1;

                    const todayItem = calendar.find(item => parseInt(item.day) === dayIndex);
                    if (todayItem) {
                        calendarTopic = todayItem.topic_idea || '';
                    }
                }
            } catch (err) {
                console.error("Gagal parse Kalender Konten:", err);
            }
        }

        const displayTopic = todaysContent ? todaysContent.topic : calendarTopic;

        this.container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                    
                    <!-- Form input parameter (Kiri - 4 Kolom) -->
                    <div class="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
                         <div class="flex items-center gap-3 border-b pb-4">
                             <div class="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                                 <i data-lucide="sparkles" class="w-5 h-5"></i>
                             </div>
                             <div>
                                 <h3 class="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest italic">AI Social Media Kit</h3>
                                 <p class="text-[9px] text-slate-500 font-medium">Buat aset carousel & naskah video instan dalam sekali klik.</p>
                             </div>
                         </div>
                         
                         <!-- Indikator Konten Harian -->
                         ${todaysContent ? `
                         <div class="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-left">
                              <p class="text-[9px] font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>Konten Hari Ini Siap!</p>
                              <p class="text-[11px] font-bold text-slate-800 mt-1">Hari ${todaysContent.day_index}: ${todaysContent.topic}</p>
                              <p class="text-[9px] text-slate-400 mt-0.5">Format rekomendasi: ${todaysContent.format}</p>
                         </div>
                         ` : (calendarTopic ? `
                         <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
                              <p class="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Topik Hari Ini Terdeteksi</p>
                              <p class="text-[11px] font-bold text-slate-700 mt-1">${calendarTopic}</p>
                         </div>
                         ` : ''))}

                         <div class="space-y-4">
                             <div>
                                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Topik Utama Konten</label>
                                  <textarea id="topic-input" placeholder="Ketik topik promosi iklan properti..." class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none shadow-inner">${displayTopic}</textarea>
                             </div>

                             <div>
                                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Angle Copywriting</label>
                                  <select id="creative-angle" class="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-teal-500">
                                       <option value="Syariah Murni Tanpa Sita">Angle: Syariah Murni Tanpa Sita</option>
                                       <option value="Rumah Pertama Milenial">Angle: Rumah Pertama Milenial</option>
                                       <option value="Investasi Properti Menguntungkan">Angle: Investasi Properti Menguntungkan</option>
                                  </select>
                             </div>

                             <div>
                                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Detail Tambahan (Opsional)</label>
                                  <textarea id="additional-input" placeholder="Masukkan harga mulai, diskon DP, cash back, dll..." class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none shadow-inner"></textarea>
                             </div>

                             <button id="btn-generate-kit" class="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all active:scale-95 flex items-center justify-center gap-1.5">
                                  <i data-lucide="wand-2" class="w-4 h-4"></i> Generate Social Media Kit
                             </button>
                         </div>
                    </div>

                    <!-- Panel Output Hasil (Kanan - 8 Kolom) -->
                    <div class="lg:col-span-8 space-y-6">
                         <!-- Header Tab Menu -->
                         <div class="flex space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto hide-scroll shrink-0">
                              <button data-tab="carousel" class="kit-tab-btn flex-1 py-3 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shrink-0 min-w-[130px]">
                                   <i data-lucide="instagram" class="w-4 h-4"></i> Carousel Studio
                              </button>
                              <button data-tab="video" class="kit-tab-btn flex-1 py-3 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shrink-0 min-w-[130px]">
                                   <i data-lucide="video" class="w-4 h-4"></i> Video & VO Script
                              </button>
                              <button data-tab="copywriting" class="kit-tab-btn flex-1 py-3 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shrink-0 min-w-[130px]">
                                   <i data-lucide="file-text" class="w-4 h-4"></i> Copywriting
                              </button>
                         </div>

                         <!-- Konten dari Tab Terpilih -->
                         <div id="kit-tab-content-area" class="min-h-[400px]">
                              <!-- Diisi dinamis -->
                         </div>
                    </div>

                </div>
            </div>
        `;

        this.container.querySelector('#btn-generate-kit').addEventListener('click', () => this.generateKit());
        
        this.container.querySelectorAll('.kit-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        this.switchTab(this.activeTab);
        if (window.lucide) window.lucide.createIcons();
    }

    switchTab(tabKey) {
        this.activeTab = tabKey;

        this.container.querySelectorAll('.kit-tab-btn').forEach(btn => {
            if (btn.dataset.tab === tabKey) {
                btn.classList.add('bg-teal-600', 'text-white', 'shadow-lg');
                btn.classList.remove('text-slate-400', 'hover:bg-slate-50');
            } else {
                btn.classList.remove('bg-teal-600', 'text-white', 'shadow-lg');
                btn.classList.add('text-slate-400', 'hover:bg-slate-50');
            }
        });

        this.renderTabContent();
    }

    renderTabContent() {
        const area = this.container.querySelector('#kit-tab-content-area');
        if (!area) return;

        if (!this.kitResult) {
            area.innerHTML = `
                <div class="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center opacity-40 min-h-[400px]">
                    <i data-lucide="bot" class="w-12 h-12 text-teal-600 mb-4 animate-bounce"></i>
                    <h4 class="font-bold text-slate-700">AI Social Media Kit Siap Dibuat</h4>
                    <p class="text-xs text-slate-500 max-w-xs mt-1">Masukkan topik promosi di sisi kiri dan klik "Generate" untuk menyusun materi promo lengkap.</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        if (this.activeTab === 'carousel') {
            const slide = this.kitResult.carousel_slides[this.currentSlide - 1];
            
            // Ambil daftar foto album properti dari settings
            const album = this.state.developerSettings?.property_album;
            let albumList = [];
            if (album) {
                try {
                    albumList = typeof album === 'string' ? JSON.parse(album) : album;
                } catch (e) {
                    albumList = [];
                }
            }
            if (!Array.isArray(albumList)) albumList = [];

            // Tentukan background image mockup
            let bgUrl = 'assets/img/default-house.jpg'; // default fallback
            if (this.selectedImage !== 'default') {
                bgUrl = this.selectedImage;
            } else if (albumList.length > 0) {
                bgUrl = albumList[(this.currentSlide - 1) % albumList.length];
            }

            const bgOptions = albumList.map((url, i) => `
                <option value="${url}" ${bgUrl === url ? 'selected' : ''}>Foto Album #${i + 1}</option>
            `).join('');

            // Terapkan class gaya tema
            let themeOverlayClass = "bg-gradient-to-t from-black/85 via-black/45 to-black/20";
            let textStyleClass = "text-white font-sans font-black text-center";
            let borderStyleClass = "";

            if (this.currentTheme === 'teal') {
                borderStyleClass = "border-[10px] border-teal-700/80";
                textStyleClass = "text-white font-sans font-extrabold text-center tracking-tight leading-snug";
            } else if (this.currentTheme === 'gold') {
                borderStyleClass = "border-[10px] border-amber-600/80";
                textStyleClass = "text-yellow-100 font-serif italic font-bold text-center leading-relaxed";
            } else if (this.currentTheme === 'dark') {
                borderStyleClass = "border-[10px] border-slate-900";
                textStyleClass = "text-white font-sans font-black text-center uppercase tracking-widest";
            }

            area.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm animate-in">
                    <!-- Sisi Kiri: Mockup Frame Instagram -->
                    <div class="space-y-4 flex flex-col items-center">
                         <div class="w-full text-center">
                              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Live Instagram Carousel Mockup</p>
                         </div>
                         
                         <!-- Mockup Container -->
                         <div id="carousel-mockup" class="relative aspect-square w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl ${borderStyleClass} bg-slate-950 flex flex-col justify-between p-6 select-none transition-all">
                              <div class="absolute inset-0 z-0">
                                   <img src="${bgUrl}" class="w-full h-full object-cover" />
                                   <div class="absolute inset-0 ${themeOverlayClass}"></div>
                              </div>
                              
                              <!-- Header brand -->
                              <div class="relative z-10 flex items-center justify-between text-white">
                                   <div class="flex items-center gap-2">
                                        <img src="${this.state.developerSettings?.logo_url || ''}" class="w-6 h-6 rounded-full bg-white object-contain ${this.state.developerSettings?.logo_url ? '' : 'hidden'}" />
                                        <span class="text-[9px] font-bold tracking-wider drop-shadow-md uppercase">${this.state.developerSettings?.app_name || 'PROPERTY SYARIAH'}</span>
                                   </div>
                                   <span class="text-[8px] bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Slide ${this.currentSlide} / 6</span>
                              </div>

                              <!-- Body Teks Slide -->
                              <div class="relative z-10 my-auto py-4">
                                   <h3 class="text-sm md:text-base ${textStyleClass} drop-shadow-lg" id="mock-slide-text">
                                        "${slide ? slide.text_overlay : 'Memuat teks...'}"
                                   </h3>
                              </div>

                              <!-- Footer branding -->
                              <div class="relative z-10 text-center text-[8px] text-white/80 font-bold tracking-widest drop-shadow-md border-t border-white/10 pt-2 uppercase">
                                   Tanpa Riba • Tanpa Sita • Tanpa Denda
                              </div>
                         </div>

                         <!-- Navigasi Slide -->
                         <div class="flex items-center gap-3">
                              <button id="btn-prev-slide" class="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-90" ${this.currentSlide === 1 ? 'disabled opacity-40' : ''}>
                                   <i data-lucide="chevron-left" class="w-4 h-4"></i>
                              </button>
                              <span class="text-xs font-bold text-slate-600 select-none">Slide ${this.currentSlide} of 6</span>
                              <button id="btn-next-slide" class="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-90" ${this.currentSlide === 6 ? 'disabled opacity-40' : ''}>
                                   <i data-lucide="chevron-right" class="w-4 h-4"></i>
                              </button>
                         </div>
                    </div>

                    <!-- Sisi Kanan: Kontrol & Kustomisasi -->
                    <div class="space-y-4 flex flex-col justify-between">
                         <div class="space-y-4">
                              <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-2 italic">Desain Slide</h4>
                              
                              <div>
                                   <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Latar Belakang Gambar</label>
                                   <select id="select-slide-bg" class="w-full bg-slate-50 border p-3.5 rounded-xl text-[10px] font-bold outline-none">
                                        <option value="default">Gunakan Foto Unit Otomatis</option>
                                        ${bgOptions}
                                   </select>
                                   <p class="text-[8px] text-slate-400 mt-1">Ubah foto unit properti untuk slide ini (bisa diupload di menu Settings).</p>
                              </div>

                              <div>
                                   <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tema Desain Poster</label>
                                   <div class="grid grid-cols-3 gap-2">
                                        <button data-theme="teal" class="theme-btn py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${this.currentTheme === 'teal' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 border-slate-200 text-slate-500'}">Modern Teal</button>
                                        <button data-theme="gold" class="theme-btn py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${this.currentTheme === 'gold' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 border-slate-200 text-slate-500'}">Premium Gold</button>
                                        <button data-theme="dark" class="theme-btn py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${this.currentTheme === 'dark' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-500'}">Elegant Dark</button>
                                   </div>
                              </div>

                              <div>
                                   <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sesuaikan Tulisan Slide</label>
                                   <textarea id="edit-slide-text" class="w-full p-3 bg-slate-50 border rounded-xl text-xs font-semibold h-16 outline-none focus:ring-1 focus:ring-teal-500 resize-none">${slide ? slide.text_overlay : ''}</textarea>
                              </div>
                         </div>

                         <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                              <button id="btn-download-slide" class="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5">
                                   <i data-lucide="download" class="w-4 h-4"></i> Unduh Slide Ini (PNG)
                              </button>
                              <a href="https://instagram.com" target="_blank" class="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5">
                                   <i data-lucide="external-link" class="w-4 h-4"></i> Buka IG
                              </a>
                         </div>
                    </div>
                </div>
            `;

            // Attach controls listeners
            this.container.querySelector('#btn-prev-slide').onclick = () => {
                if (this.currentSlide > 1) {
                    this.currentSlide--;
                    this.renderTabContent();
                }
            };
            this.container.querySelector('#btn-next-slide').onclick = () => {
                if (this.currentSlide < 6) {
                    this.currentSlide++;
                    this.renderTabContent();
                }
            };
            this.container.querySelector('#select-slide-bg').onchange = (e) => {
                this.selectedImage = e.target.value;
                this.renderTabContent();
            };
            this.container.querySelectorAll('.theme-btn').forEach(btn => {
                btn.onclick = (e) => {
                    this.currentTheme = e.currentTarget.dataset.theme;
                    this.renderTabContent();
                };
            });
            this.container.querySelector('#edit-slide-text').oninput = (e) => {
                slide.text_overlay = e.target.value;
                this.container.querySelector('#mock-slide-text').innerText = `"${e.target.value}"`;
            };
            this.container.querySelector('#btn-download-slide').onclick = () => this.downloadCurrentSlide();

        } else if (this.activeTab === 'video') {
            area.innerHTML = `
                <div class="bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-6 animate-in text-left">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                         <p class="text-[9px] font-black text-teal-400 uppercase tracking-widest flex items-center"><i data-lucide="video" class="w-4 h-4 mr-1.5"></i> Video & Voice-Over Studio</p>
                    </div>

                    <div>
                         <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Judul Hook Viral (3 Detik Pertama)</p>
                         <p class="text-xs md:text-sm font-black text-orange-400 select-all border border-slate-800 bg-slate-950 p-3 rounded-xl">${this.kitResult.hook_title || 'Tidak ada hook.'}</p>
                    </div>

                    <div>
                         <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Naskah Suara (Voice-Over Script)</p>
                         <div class="text-xs leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-36 overflow-y-auto select-all whitespace-pre-wrap">${this.kitResult.voice_over_script || 'Tidak ada naskah.'}</div>
                    </div>

                    <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                         <div class="flex items-center justify-between">
                              <p class="text-[8px] font-black text-purple-400 uppercase tracking-widest">Prompt Video AI (Veo/Runway)</p>
                              <button id="btn-copy-video-prompt" class="px-3 py-1 bg-purple-900/50 hover:bg-purple-900 text-purple-200 border border-purple-800 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all">Salin Prompt</button>
                         </div>
                         <p class="text-[10px] italic leading-relaxed text-slate-300 font-serif select-all">"${this.kitResult.video_prompt || 'Tidak ada prompt.'}"</p>
                         <p class="text-[8px] text-slate-500 mt-1">Salin prompt di atas untuk dimasukkan ke pembuat video AI eksternal seperti Google Veo atau Runway.</p>
                    </div>

                    <div class="pt-2 flex flex-col sm:flex-row gap-2.5">
                         <a href="https://tiktok.com" target="_blank" class="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 shadow-md">
                              <i data-lucide="external-link" class="w-4 h-4"></i> Buka TikTok
                         </a>
                         <a href="https://youtube.com" target="_blank" class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 shadow-md">
                              <i data-lucide="external-link" class="w-4 h-4"></i> Buka Shorts
                         </a>
                    </div>
                </div>
            `;

            this.container.querySelector('#btn-copy-video-prompt').onclick = (e) => {
                navigator.clipboard.writeText(this.kitResult.video_prompt);
                e.currentTarget.innerText = "Tersalin!";
                setTimeout(() => {
                    if (this.container.querySelector('#btn-copy-video-prompt')) {
                        this.container.querySelector('#btn-copy-video-prompt').innerText = "Salin Prompt";
                    }
                }, 2000);
            };

        } else if (this.activeTab === 'copywriting') {
            area.innerHTML = `
                <div class="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-5 text-left animate-in">
                    <div class="flex items-center justify-between border-b pb-3">
                         <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider italic flex items-center"><i data-lucide="file-text" class="w-4 h-4 mr-1.5 text-teal-600"></i> Copywriting & Hashtags</h4>
                         <button id="btn-copy-caption" class="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-md">Salin Caption</button>
                    </div>

                    <div>
                         <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Caption Posting</label>
                         <div class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium h-48 overflow-y-auto select-all whitespace-pre-wrap">${this.kitResult.caption || 'Tidak ada caption.'}</div>
                    </div>

                    <div>
                         <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tagar Hashtag Berdasarkan Algoritma</label>
                         <div class="grid grid-cols-2 gap-3">
                              <div class="bg-slate-50 border p-3 rounded-xl">
                                   <div class="flex justify-between items-center mb-1"><span class="text-[8px] font-black text-slate-600 uppercase">Instagram</span><button data-platform="instagram" class="btn-copy-tag text-[8px] text-teal-600 font-bold">Salin</button></div>
                                   <p class="text-[9px] text-slate-500 font-mono truncate select-all">${this.kitResult.hashtags?.instagram || ''}</p>
                              </div>
                              <div class="bg-slate-50 border p-3 rounded-xl">
                                   <div class="flex justify-between items-center mb-1"><span class="text-[8px] font-black text-slate-600 uppercase">Facebook</span><button data-platform="facebook" class="btn-copy-tag text-[8px] text-teal-600 font-bold">Salin</button></div>
                                   <p class="text-[9px] text-slate-500 font-mono truncate select-all">${this.kitResult.hashtags?.facebook || ''}</p>
                              </div>
                              <div class="bg-slate-50 border p-3 rounded-xl">
                                   <div class="flex justify-between items-center mb-1"><span class="text-[8px] font-black text-slate-600 uppercase">TikTok</span><button data-platform="tiktok" class="btn-copy-tag text-[8px] text-teal-600 font-bold">Salin</button></div>
                                   <p class="text-[9px] text-slate-500 font-mono truncate select-all">${this.kitResult.hashtags?.tiktok || ''}</p>
                              </div>
                              <div class="bg-slate-50 border p-3 rounded-xl">
                                   <div class="flex justify-between items-center mb-1"><span class="text-[8px] font-black text-slate-600 uppercase">YouTube Shorts</span><button data-platform="shorts" class="btn-copy-tag text-[8px] text-teal-600 font-bold">Salin</button></div>
                                   <p class="text-[9px] text-slate-500 font-mono truncate select-all">${this.kitResult.hashtags?.shorts || ''}</p>
                              </div>
                         </div>
                    </div>
                </div>
            `;

            this.container.querySelector('#btn-copy-caption').onclick = (e) => {
                navigator.clipboard.writeText(this.kitResult.caption);
                e.currentTarget.innerText = "Tersalin!";
                setTimeout(() => {
                    if (this.container.querySelector('#btn-copy-caption')) {
                        this.container.querySelector('#btn-copy-caption').innerText = "Salin Caption";
                    }
                }, 2000);
            };

            this.container.querySelectorAll('.btn-copy-tag').forEach(btn => {
                btn.onclick = (e) => {
                    const platform = e.currentTarget.dataset.platform;
                    const tags = this.kitResult.hashtags?.[platform] || '';
                    navigator.clipboard.writeText(tags);
                    e.currentTarget.innerText = "Tersalin!";
                    setTimeout(() => {
                        e.target.innerText = "Salin";
                    }, 2000);
                };
            });
        }

        if (window.lucide) window.lucide.createIcons();
    }

    async generateKit() {
        const topic = this.container.querySelector('#topic-input').value;
        const angle = this.container.querySelector('#creative-angle').value;
        const input = this.container.querySelector('#additional-input').value;
        const btn = this.container.querySelector('#btn-generate-kit');
        const contentArea = this.container.querySelector('#kit-tab-content-area');

        if (!topic) {
            alert('Silakan masukkan topik utama konten terlebih dahulu.');
            return;
        }

        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Processing...`;
        btn.disabled = true;

        contentArea.innerHTML = `
            <div class="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <i data-lucide="cpu" class="w-12 h-12 text-teal-600 mb-4 animate-spin"></i>
                <h4 class="font-bold text-slate-700">AI Agent sedang meramu konten kit...</h4>
                <p class="text-xs text-slate-500 max-w-xs mt-1 animate-pulse">Menghasilkan hook viral, naskah video, caption, dan 6 slide poster visual...</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();

        try {
            const persona = this.state.developerSettings?.ai_persona_insight || 'Target market umum properti syariah';

            const prompt = `Anda adalah seorang Creative Copywriter dan Social Media Planner ahli untuk perumahan syariah.
        
**KONTEKS BUYER PERSONA:**
---
${persona}
---

**TUGAS ANDA:**
Susunlah sebuah **AI Social Media Kit** terpadu untuk topik konten:
- **Topik:** "${topic}"
- **Angle/Sudut Pandang:** "${angle}"
- **Detail Tambahan:** "${input || 'Tidak ada.'}"

**INSTRUKSI OUTPUT (WAJIB JSON TUNGGAL YANG BISA DI-PARSE):**
Kembalikan output hanya berupa data JSON terstruktur sebagai berikut:
{
  "hook_title": "Judul Hook Viral yang menarik minat dalam 3 detik pertama",
  "carousel_slides": [
    {
      "slide_number": 1,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 1",
      "text_overlay": "Teks singkat pembuka di slide 1"
    },
    {
      "slide_number": 2,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 2",
      "text_overlay": "Poin masalah atau fakta di slide 2"
    },
    {
      "slide_number": 3,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 3",
      "text_overlay": "Poin agitasi/pendalaman masalah di slide 3"
    },
    {
      "slide_number": 4,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 4",
      "text_overlay": "Solusi syariah yang ditawarkan di slide 4"
    },
    {
      "slide_number": 5,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 5",
      "text_overlay": "Keunggulan detail unit produk di slide 5"
    },
    {
      "slide_number": 6,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 6",
      "text_overlay": "Ajakan bertindak (CTA) & info kontak di slide 6"
    }
  ],
  "video_prompt": "Prompt detail dalam bahasa Inggris untuk generator video AI (seperti Google Veo atau Runway Gen-2) agar merender video pendek unit rumah syariah aesthetic sesuai topik ini",
  "voice_over_script": "Naskah narasi suara (Voice-Over) santai, persuasif berdurasi 15-30 detik untuk dibacakan oleh pengisi suara video",
  "caption": "Copywriting teks Caption promosi lengkap dan rapi untuk diunggah di feed sosial media",
  "hashtags": {
    "instagram": "#propertisyariah #rumahminimalis #kprsyariah #instagramhashtags",
    "facebook": "#propertisyariah #rumahsyariah #facebookhashtags",
    "tiktok": "#propertisyariah #rumahminimalis #tiktokhashtags #fyp",
    "shorts": "#shorts #propertisyariah #youtubeshorts"
  }
}

Pastikan output hanya string JSON murni tanpa pembungkus markdown seperti \`\`\`json.`;

            const response = await ApiService.generateAIContent(prompt);
            const cleanResponse = (response.result || '').replace(/```json|```/g, '').trim();
            this.kitResult = JSON.parse(cleanResponse);

            // Simpan otomatis ke database setting agar tidak hilang jika reload
            const formData = new FormData();
            formData.append('developer_id', this.state.currentUser.developer_id);
            formData.append('user_id', this.state.currentUser.id);
            
            const encodedCaption = btoa(unescape(encodeURIComponent(this.kitResult.caption)));
            const encodedVisual = btoa(unescape(encodeURIComponent(JSON.stringify(this.kitResult.carousel_slides))));
            const encodedVideo = btoa(unescape(encodeURIComponent(JSON.stringify({
                hook_title: this.kitResult.hook_title,
                video_prompt: this.kitResult.video_prompt,
                voice_over_script: this.kitResult.voice_over_script,
                hashtags: this.kitResult.hashtags
            }))));

            formData.append('ai_creative_caption', encodedCaption);
            formData.append('ai_creative_visual', encodedVisual);
            formData.append('ai_creative_video', encodedVideo);

            await fetch('api/save_developer_settings.php', { method: 'POST', body: formData });
            
            this.switchTab(this.activeTab);

        } catch (error) {
            contentArea.innerHTML = `
                <div class="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-500 font-bold text-center">
                    Gagal merancang kit: ${error.message}
                </div>
            `;
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    downloadCurrentSlide() {
        const slide = this.kitResult.carousel_slides[this.currentSlide - 1];
        if (!slide) return;

        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');

        const bgImg = new Image();
        bgImg.crossOrigin = "Anonymous";

        // Ambil URL gambar background
        let imgUrl = 'assets/img/default-house.jpg'; 
        if (this.selectedImage !== 'default') {
            imgUrl = this.selectedImage;
        } else {
            const album = this.state.developerSettings?.property_album;
            let albumList = [];
            if (album) {
                try {
                    albumList = typeof album === 'string' ? JSON.parse(album) : album;
                } catch(e) {}
            }
            if (Array.isArray(albumList) && albumList.length > 0) {
                imgUrl = albumList[(this.currentSlide - 1) % albumList.length];
            }
        }

        if (imgUrl.startsWith('/')) {
            imgUrl = window.location.origin + imgUrl;
        }

        bgImg.src = imgUrl;
        bgImg.onload = () => {
            // Draw background image crop cover
            const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
            const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
            const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
            ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);

            // Draw dark overlay gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
            gradient.addColorStop(0.5, 'rgba(0,0,0,0.4)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Theme borders
            if (this.currentTheme === 'teal') {
                ctx.strokeStyle = '#0f766e';
                ctx.lineWidth = 20;
                ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
            } else if (this.currentTheme === 'gold') {
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 20;
                ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
            }

            // Draw Logo (if available)
            const logoUrl = this.state.developerSettings?.logo_url;
            if (logoUrl) {
                const logoImg = new Image();
                logoImg.crossOrigin = "Anonymous";
                logoImg.src = window.location.origin + logoUrl;
                logoImg.onload = () => {
                    ctx.drawImage(logoImg, 60, 60, 100, 100);
                    drawTextAndDownload();
                };
                logoImg.onerror = () => {
                    drawTextAndDownload();
                };
            } else {
                drawTextAndDownload();
            }

            const drawTextAndDownload = () => {
                // Write Brand Name
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.font = 'bold 28px sans-serif';
                ctx.fillText(this.state.developerSettings?.app_name || 'PROPERTY SYARIAH', logoUrl ? 180 : 60, 120);

                // Write Slide Number Badge
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(canvas.width - 100, 110, 40, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.font = 'bold 24px sans-serif';
                ctx.fillText(`${this.currentSlide}/6`, canvas.width - 100, 118);

                // Write Slide Text
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                
                let fontStyle = 'bold 48px sans-serif';
                if (this.currentTheme === 'gold') {
                    fontStyle = 'italic bold 50px Georgia, serif';
                    ctx.fillStyle = '#fef08a';
                } else if (this.currentTheme === 'teal') {
                    fontStyle = '900 48px sans-serif';
                }
                ctx.font = fontStyle;

                const text = slide.text_overlay;
                const words = text.split(' ');
                let line = '';
                const lines = [];
                const maxWidth = 850;
                const lineHeight = 65;

                for (let n = 0; n < words.length; n++) {
                    let testLine = line + words[n] + ' ';
                    let metrics = ctx.measureText(testLine);
                    let testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                let startY = (canvas.height / 2) - ((lines.length - 1) * lineHeight / 2);
                for (let k = 0; k < lines.length; k++) {
                    ctx.fillText(lines[k].trim(), canvas.width / 2, startY + (k * lineHeight));
                }

                // Draw Footer Info
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 24px sans-serif';
                ctx.fillText('Tanpa Riba • Tanpa Sita • Tanpa Denda', canvas.width / 2, canvas.height - 90);

                // Trigger download
                const link = document.createElement('a');
                link.download = `Slide_${this.currentSlide}_${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
        };
        bgImg.onerror = () => {
            alert('Gagal memuat gambar latar belakang untuk download.');
        };
    }
}

// 3. OBJECTION GEN
export class ObjectionGenComponent {
    constructor(containerId) { this.container = document.getElementById(containerId); }
    render() {
        if(!this.container) return;
        this.container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6 md:space-y-8">
                <div class="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 class="text-xs md:text-sm font-black text-slate-800 mb-6 uppercase tracking-widest text-center italic">Handling Objection Master AI <span class="text-[9px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full not-italic ml-2">MGO AI</span></h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        ${this.btn('mahal', 'Harganya kemahalan pak...')}
                        ${this.btn('legal', 'Gimana legalitasnya, aman?')}
                        ${this.btn('jauh', 'Lokasinya kok jauh ya?')}
                        ${this.btn('bank', 'Saya biasanya pake KPR Bank...')}
                    </div>
                    <div class="bg-teal-950 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-4 opacity-5"><i data-lucide="shield-alert" class="w-16 h-16"></i></div>
                        <p class="text-[9px] md:text-[10px] font-black text-teal-400 uppercase mb-3 tracking-widest flex items-center relative z-10"><i data-lucide="message-square" class="w-4 h-4 mr-2"></i> Script Jawaban Taktis AI:</p>
                        <p id="objection-text" class="text-xs md:text-sm font-medium leading-relaxed italic text-teal-50/80 relative z-10 border-l-2 border-teal-500 pl-4 md:pl-6">Pilih salah satu keberatan di atas untuk mendapatkan jawaban taktis AI.</p>
                    </div>
                </div>
            </div>
        `;
        this.container.querySelectorAll('button').forEach(b => b.addEventListener('click', (e) => this.handle(e.currentTarget.dataset.type)));
        if(window.lucide) window.lucide.createIcons();
    }
    btn(type, text) {
        return `<button data-type="${type}" class="text-left p-5 border rounded-2xl hover:border-teal-500 hover:bg-slate-50 transition-all group active:scale-95 shadow-sm border-slate-100">
            <p class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-1">Keberatan Prospek:</p>
            <p class="text-[10px] md:text-[11px] font-bold text-slate-700 italic">"${text}"</p>
        </button>`;
    }
    async handle(type) {
        const objectionMap = {
            mahal: "Harganya kemahalan pak...",
            legal: "Gimana legalitasnya, aman?",
            jauh: "Lokasinya kok jauh ya?",
            bank: "Saya biasanya pake KPR Bank..."
        };
        
        const container = this.container.querySelector('#objection-text');
        container.innerText = "Sedang meramu jawaban taktis...";
        
        try {
            const prompt = `Berikan script jawaban sales properti syariah yang taktis, sopan, dan persuasif untuk menangani keberatan prospek: "${objectionMap[type]}". Jawaban harus singkat (max 2 kalimat) dan menekankan value syariah/investasi.`;
            const response = await ApiService.generateAIContent(prompt);
            container.innerText = response.result;
        } catch (error) {
            container.innerText = `Gagal memuat AI: ${error.message}`;
        }
    }
}

// 4. PERSONA INSIGHT
export class PersonaInsightComponent {
    constructor(containerId, state) { 
        this.container = document.getElementById(containerId);
        this.state = state;
        this.lastAIResult = null; // Untuk menyimpan hasil AI sementara
        this.mode = 'manual'; // 'manual' atau 'auto'
    }

    render() {
        if(!this.container) return;

        // Hitung Statistik Real-time dari Data Leads
        const leads = this.state.leads || [];
        const closingLeads = leads.filter(l => l.status === 'CLOSING');
        const savedInsight = this.state.developerSettings?.ai_persona_insight;
        const totalLeads = leads.length;
        const totalClosing = closingLeads.length;

        if (totalLeads === 0) {
            this.container.innerHTML = `<div class="p-10 text-center text-slate-400">Belum ada data lead untuk dianalisis. Silakan input data lead terlebih dahulu.</div>`;
            return;
        }

        // Fungsi helper untuk mencari nilai terbanyak (modus)
        const getTop = (leadsList, field) => {
            const counts = {};
            leadsList.forEach(l => {
                const val = l[field] || 'Unknown';
                counts[val] = (counts[val] || 0) + 1;
            });
            return Object.entries(counts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Unknown';
        };

        const topJob = getTop(leads, 'job');
        const topSegment = getTop(leads, 'segment');
        const topChannel = getTop(leads, 'channel');

        const topClosingJob = totalClosing > 0 ? getTop(closingLeads, 'job') : topJob;
        const topClosingSegment = totalClosing > 0 ? getTop(closingLeads, 'segment') : topSegment;
        const topClosingChannel = totalClosing > 0 ? getTop(closingLeads, 'channel') : topChannel;

        this.container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-6">
                <div class="bg-teal-900 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden text-center md:text-left">
                    <div class="absolute top-0 right-0 p-8 opacity-10 hidden md:block"><i data-lucide="user-check" class="w-24 h-24"></i></div>
                    <h3 class="text-xl md:text-2xl font-black mb-2 italic leading-tight uppercase tracking-tighter">Global AI Buyer Persona & Agent</h3>
                    <p class="text-[10px] md:text-xs opacity-70 font-medium italic max-w-lg mx-auto md:mx-0 mb-6">"Data dari <strong class="text-orange-400">${totalLeads} Lead</strong> (Closing: <strong class="text-teal-400">${totalClosing}</strong>) dianalisis otomatis untuk membedah psikologi & menyusun jadwal promosi."</p>
                    
                    <!-- Toggle AI Agent Mode -->
                    <div class="flex items-center justify-center md:justify-start gap-4 mb-6">
                        <span class="text-[10px] font-black text-teal-200 uppercase tracking-widest">Mode AI Agent:</span>
                        <div class="inline-flex rounded-xl p-0.5 bg-slate-950/40 border border-white/10">
                            <button id="toggle-manual" class="px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${this.mode === 'manual' ? 'bg-orange-500 text-white shadow-md' : 'text-teal-300 hover:text-white'}">Manual</button>
                            <button id="toggle-auto" class="px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${this.mode === 'auto' ? 'bg-orange-500 text-white shadow-md' : 'text-teal-300 hover:text-white'}">Otomatis</button>
                        </div>
                    </div>

                    <!-- Area Manual -->
                    <div id="manual-mode-area" class="${this.mode === 'manual' ? 'block' : 'hidden'}">
                        <button id="btn-analyze-persona" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 mx-auto md:mx-0">
                            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                            <span>Generate Buyer Persona</span>
                        </button>
                        <p class="text-[9px] text-teal-200 mt-2.5 italic font-semibold">AI Agent akan otomatis menyusun kalender konten 1 pekan (7 hari) secara default.</p>
                    </div>

                    <!-- Area Otomatis -->
                    <div id="auto-mode-area" class="${this.mode === 'auto' ? 'block' : 'hidden'}">
                        <div class="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                            <select id="auto-interval" class="bg-teal-950 border border-teal-700 text-white p-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto">
                                <option value="7">Generate Tiap 1 Pekan (7 Hari)</option>
                                <option value="30">Generate Tiap 1 Bulan (30 Hari)</option>
                            </select>
                            <button id="btn-activate-agent" class="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5">
                                <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                                <span>Aktifkan AI Agent</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- AI Agent Console -->
                <div id="agent-console" class="hidden bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-left font-mono text-[10px] md:text-xs text-teal-400 max-w-3xl mx-auto space-y-2 shadow-2xl relative overflow-hidden">
                    <div class="flex items-center justify-between border-b border-slate-900 pb-3 mb-3 text-slate-400">
                        <span class="flex items-center gap-2 font-black uppercase text-[9px] tracking-widest text-slate-300"><i data-lucide="cpu" class="w-4 h-4 text-orange-400 animate-spin"></i> MGO AI Agent Workflow Console</span>
                        <span class="text-[8px] bg-slate-900 px-2.5 py-1 rounded-full text-orange-400 uppercase font-black tracking-widest border border-white/5 animate-pulse">Running</span>
                    </div>
                    <div id="agent-log-lines" class="space-y-2 h-44 overflow-y-auto custom-scrollbar pr-2">
                        <!-- Logs -->
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    <div class="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200 text-center">
                        <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Pekerjaan Utama</p>
                        <p class="text-xl md:text-2xl font-black text-slate-800 tracking-tighter px-2 truncate">${topJob}</p>
                        <p class="text-[9px] text-teal-600 font-bold mt-1 uppercase">Closing: ${topClosingJob}</p>
                    </div>
                    <div class="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200 text-center">
                        <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Segmen Dominan</p>
                        <p class="text-xl md:text-2xl font-black text-teal-600 tracking-tighter px-2 truncate">${topSegment}</p>
                        <p class="text-[9px] text-teal-600 font-bold mt-1 uppercase">Closing: ${topClosingSegment}</p>
                    </div>
                    <div class="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-200 text-center">
                        <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Top Channel</p>
                        <p class="text-xl md:text-2xl font-black text-orange-500 tracking-tighter px-2 truncate">${topChannel}</p>
                        <p class="text-[9px] text-teal-600 font-bold mt-1 uppercase">Closing: ${topClosingChannel}</p>
                    </div>
                </div>

                <!-- AI Result Grid -->
                <div id="persona-result-grid" class="hidden grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 animate-in">
                    <!-- Persona Insight Result -->
                    <div id="persona-result-card" class="lg:col-span-3 bg-white p-6 md:p-10 rounded-[2rem] shadow-lg border border-teal-100">
                        <div class="flex items-center mb-4">
                            <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-4">
                                <i data-lucide="bot" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h4 class="font-black text-slate-800 text-lg uppercase tracking-widest">AI Buyer Persona</h4>
                                <p class="text-[10px] text-slate-400 font-bold">Powered by MGO AI</p>
                            </div>
                        </div>
                        <div id="persona-content" class="text-xs md:text-sm text-slate-600 leading-relaxed font-medium space-y-2"></div>
                    </div>
                    <!-- Channel Recommendation Result -->
                    <div id="channel-result-card" class="lg:col-span-2 bg-slate-800 text-white p-6 md:p-10 rounded-[2rem] shadow-lg border border-slate-700">
                         <div class="flex items-center mb-4">
                            <div class="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mr-4">
                                <i data-lucide="megaphone" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h4 class="font-black text-white text-lg uppercase tracking-widest">Rekomendasi Channel</h4>
                                <p class="text-[10px] text-slate-400 font-bold">Analisis AI</p>
                            </div>
                        </div>
                        <div id="channel-content" class="space-y-4"></div>
                    </div>
                </div>
                <div id="save-button-container" class="text-center"></div>
            </div>
        `;

        const toggleManualBtn = this.container.querySelector('#toggle-manual');
        const toggleAutoBtn = this.container.querySelector('#toggle-auto');
        const manualArea = this.container.querySelector('#manual-mode-area');
        const autoArea = this.container.querySelector('#auto-mode-area');

        toggleManualBtn.addEventListener('click', () => {
            this.mode = 'manual';
            toggleManualBtn.className = "px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all bg-orange-500 text-white shadow-md";
            toggleAutoBtn.className = "px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all text-teal-300 hover:text-white";
            manualArea.classList.remove('hidden');
            autoArea.classList.add('hidden');
        });

        toggleAutoBtn.addEventListener('click', () => {
            this.mode = 'auto';
            toggleAutoBtn.className = "px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all bg-orange-500 text-white shadow-md";
            toggleManualBtn.className = "px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all text-teal-300 hover:text-white";
            autoArea.classList.remove('hidden');
            manualArea.classList.add('hidden');
        });

        this.container.querySelector('#btn-analyze-persona').addEventListener('click', () => {
            this.runAgentWorkflow(7);
        });

        if (this.container.querySelector('#btn-activate-agent')) {
            this.container.querySelector('#btn-activate-agent').addEventListener('click', () => {
                const duration = parseInt(this.container.querySelector('#auto-interval').value);
                this.runAgentWorkflow(duration);
            });
        }
        
        // Jika ada data tersimpan, langsung tampilkan
        if (savedInsight) {
            this.displayResult(savedInsight, false);
        }

        if(window.lucide) window.lucide.createIcons();
    }

    async runAgentWorkflow(duration) {
        const consoleEl = this.container.querySelector('#agent-console');
        const logLinesEl = this.container.querySelector('#agent-log-lines');
        const resultGrid = this.container.querySelector('#persona-result-grid');
        const btnManual = this.container.querySelector('#btn-analyze-persona');
        const btnAuto = this.container.querySelector('#btn-activate-agent');
        
        resultGrid.classList.add('hidden');
        consoleEl.classList.remove('hidden');
        logLinesEl.innerHTML = '';
        
        if (btnManual) btnManual.disabled = true;
        if (btnAuto) btnAuto.disabled = true;

        const addLog = (msg, type = 'info') => {
            const time = new Date().toLocaleTimeString('id-ID');
            let icon = 'info';
            let color = 'text-slate-400';
            if (type === 'start') { icon = 'play'; color = 'text-teal-400 font-bold'; }
            if (type === 'success') { icon = 'check-circle'; color = 'text-green-400 font-semibold'; }
            if (type === 'gemini') { icon = 'sparkles'; color = 'text-purple-400'; }
            if (type === 'db') { icon = 'database'; color = 'text-blue-400'; }
            if (type === 'complete') { icon = 'trophy'; color = 'text-orange-400 font-black'; }
            
            const line = document.createElement('div');
            line.className = `flex items-start gap-2.5 ${color} animate-in fade-in-50 duration-300`;
            line.innerHTML = `
                <span class="text-slate-600 font-mono text-[9px] shrink-0 mt-0.5">[${time}]</span>
                <i data-lucide="${icon}" class="w-3.5 h-3.5 shrink-0 mt-0.5"></i>
                <span class="leading-relaxed font-medium text-[11px] font-sans">${msg}</span>
            `;
            logLinesEl.appendChild(line);
            logLinesEl.scrollTop = logLinesEl.scrollHeight;
            if (window.lucide) window.lucide.createIcons();
        };

        // Hitung Data Pipeline
        const leads = this.state.leads || [];
        const closingLeads = leads.filter(l => l.status === 'CLOSING');
        const totalLeads = leads.length;
        const totalClosing = closingLeads.length;

        const getTop = (leadsList, field) => {
            const counts = {};
            leadsList.forEach(l => {
                const val = l[field] || 'Unknown';
                counts[val] = (counts[val] || 0) + 1;
            });
            return Object.entries(counts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Unknown';
        };

        const job = getTop(leads, 'job');
        const segment = getTop(leads, 'segment');
        const channel = getTop(leads, 'channel');
        const closingJob = totalClosing > 0 ? getTop(closingLeads, 'job') : job;
        const closingSegment = totalClosing > 0 ? getTop(closingLeads, 'segment') : segment;
        const closingChannel = totalClosing > 0 ? getTop(closingLeads, 'channel') : channel;

        try {
            addLog("MGO AI Agent: Memulai alur kerja otomatisasi n8n style...", "start");
            await new Promise(r => setTimeout(r, 1000));

            addLog(`Membaca data demografi prospek dari pipeline (${totalLeads} Lead, ${totalClosing} Closing)...`, "info");
            await new Promise(r => setTimeout(r, 800));

            addLog("Memicu Node 1: Merumuskan Buyer Persona pasar via Gemini AI...", "gemini");
            
            const personaPrompt = `Sebagai konsultan properti syariah ahli, analisa Buyer Persona berdasarkan data demografi real-time berikut:

Data Minat Umum (Pipeline):
- Pekerjaan Terbanyak: ${job}
- Segmen Tertarik Terbanyak: ${segment}
- Media Masuk Terbanyak: ${channel}

Data Pembeli Konkrit (Closing):
- Pekerjaan Pembeli: ${closingJob}
- Segmen Rumah Terbeli: ${closingSegment}
- Media Masuk Pembeli: ${closingChannel}

Bandingkan profil orang yang berminat (data minat umum) dengan orang yang benar-benar melakukan closing (pembeli konkrit). Rumuskan analisis persona yang presisi berdasarkan perbandingan ini.

Berikan output dalam format JSON tunggal yang bisa di-parse, dengan struktur: {"personaInsight": "...", "channelRecommendations": [...]}.

1.  Untuk key "personaInsight" (string), berikan insight mendalam mengenai:
    - Analisis Perbedaan / Pola antara Peminat vs Pembeli Riil.
    - Psikologi & Pemicu Pembelian (Pain & Gain).
    - Gaya Komunikasi yang disukai.
    - Rekomendasi Strategi Closing.
    Format sebagai teks dengan poin-poin.

2.  Untuk key "channelRecommendations" (array of objects), berikan 3 rekomendasi channel promosi paling efektif. Setiap object dalam array harus memiliki key:
    - "channel" (string): Nama channel (e.g., 'Facebook Ads', 'Instagram Reels', 'TikTok').
    - "reason" (string): 1 kalimat alasan singkat mengapa channel itu cocok.
`;
            
            const personaResponse = await ApiService.generateAIContent(personaPrompt);
            let cleanPersonaJson = (personaResponse.result || '').replace(/```json|```/g, '').trim();
            const personaData = JSON.parse(cleanPersonaJson);
            
            addLog("Node 1 Sukses: Buyer Persona berhasil dirumuskan!", "success");
            await new Promise(r => setTimeout(r, 800));

            addLog(`Memicu Node 2: Menyusun Kalender Konten Otomatis (Durasi: ${duration} Hari, Freq: 1x/Hari)...`, "gemini");
            
            const calendarPrompt = `Anda adalah seorang Social Media Strategist ahli untuk agensi properti syariah.
            
**KONTEKS BUYER PERSONA:**
---
${personaData.personaInsight}
---

**TUGAS ANDA:**
Buatlah **Rencana Kalender Konten (Content Calendar)** yang detail dan terstruktur.

**PARAMETER:**
- **Durasi:** ${duration} hari.
- **Frekuensi:** 1 kali posting per hari.

**INSTRUKSI OUTPUT:**
Berikan output dalam format **JSON** yang bisa di-parse. Strukturnya harus berupa array of objects, di mana setiap object adalah satu jadwal post.
Setiap object harus memiliki key berikut: "day" (Hari ke-), "time_slot" (Slot Waktu ke-), "content_pillar" (Pilih salah satu: Edukasi, Promosi, Interaksi, Testimoni), "topic_idea" (Ide topik konten yang spesifik dan menarik), "format" (Saran format: Reels, Carousel, Story, Single Image), dan "hook_suggestion" (Saran 1 kalimat untuk hook/caption pembuka).

Pastikan jumlah object sesuai dengan (Durasi x Frekuensi). Jangan tambahkan teks atau penjelasan lain di luar format JSON.`;

            const calendarResponse = await ApiService.generateAIContent(calendarPrompt);
            let cleanCalendarJson = (calendarResponse.result || '').replace(/```json|```/g, '').trim();
            
            // Validate JSON
            JSON.parse(cleanCalendarJson);
            
            addLog(`Node 2 Sukses: Kalender Konten ${duration} hari berhasil dibuat!`, "success");
            await new Promise(r => setTimeout(r, 800));

            addLog("Node 3: Menyimpan seluruh hasil AI Agent ke database...", "db");
            
            const formData = new FormData();
            formData.append('developer_id', this.state.currentUser.developer_id);
            formData.append('user_id', this.state.currentUser.id);
            
            const encodedInsight = btoa(unescape(encodeURIComponent(cleanPersonaJson)));
            const encodedCalendar = btoa(unescape(encodeURIComponent(cleanCalendarJson)));
            formData.append('ai_persona_insight', encodedInsight);
            formData.append('ai_content_calendar', encodedCalendar);

            const saveResponse = await fetch('api/save_developer_settings.php', { method: 'POST', body: formData });
            if (!saveResponse.ok) throw new Error(`Server Error: ${saveResponse.status}`);
            
            // Update global state
            if (!this.state.developerSettings) this.state.developerSettings = {};
            this.state.developerSettings.ai_persona_insight = cleanPersonaJson;
            this.state.developerSettings.ai_content_calendar = cleanCalendarJson;

            addLog("Sinkronisasi database selesai!", "success");
            await new Promise(r => setTimeout(r, 800));

            addLog(`🎉 AI Agent Selesai! Kalender Konten ${duration} hari berhasil dirilis.`, "complete");
            
            // Render results
            this.displayResult(personaData, false);

        } catch (error) {
            console.error(error);
            addLog(`❌ Alur kerja AI Agent Gagal: ${error.message}`, "info");
        } finally {
            if (btnManual) btnManual.disabled = false;
            if (btnAuto) btnAuto.disabled = false;
        }
    }

    displayResult(data, isNewResult) {
        const resultGrid = this.container.querySelector('#persona-result-grid');
        const personaContent = this.container.querySelector('#persona-content');
        const channelContent = this.container.querySelector('#channel-content');
        const saveButtonContainer = this.container.querySelector('#save-button-container');

        let insightText, channelData;

        if (typeof data === 'string') {
            try {
                const parsedData = JSON.parse(data);
                insightText = parsedData.personaInsight;
                channelData = parsedData.channelRecommendations;
                this.lastAIResult = parsedData;
            } catch (e) {
                insightText = data;
                channelData = null;
                this.lastAIResult = insightText;
            }
        } else {
            insightText = data.personaInsight;
            channelData = data.channelRecommendations;
            this.lastAIResult = data;
        }

        personaContent.innerHTML = String(insightText || 'Tidak ada data.').replace(/\n/g, '<br>');

        if (channelData && Array.isArray(channelData)) {
            this.container.querySelector('#channel-result-card').style.display = 'block';
            channelContent.innerHTML = channelData.map(rec => `
                <div class="bg-slate-700/50 p-4 rounded-xl border border-slate-600 font-sans">
                    <p class="font-bold text-sm text-orange-400">${rec.channel}</p>
                    <p class="text-xs text-slate-300 italic mt-1">"${rec.reason}"</p>
                </div>
            `).join('');
        } else {
            this.container.querySelector('#channel-result-card').style.display = 'none';
        }

        resultGrid.classList.remove('hidden');
        resultGrid.style.display = 'grid';
        saveButtonContainer.innerHTML = ''; // Tombol simpan tidak diperlukan karena alur kerja n8n otomatis menyimpan
        if(window.lucide) window.lucide.createIcons();
    }
}

// 5. AI ENGINE CONFIG
export class AiEngineConfigComponent {
    constructor(containerId) { this.container = document.getElementById(containerId); }
    render() {
        if(!this.container) return;
        this.container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8">
                <div class="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div class="flex flex-col md:flex-row items-center text-center md:text-left mb-8 border-b pb-6">
                        <i data-lucide="database" class="w-8 h-8 text-teal-600 mb-3 md:mb-0 md:mr-4"></i>
                        <div><h3 class="text-sm md:text-lg font-black text-slate-800 uppercase tracking-widest italic">AI Engine Configuration</h3><p class="text-[10px] md:text-xs text-slate-500 font-medium mt-1">Pengaturan parameter dasar kecerdasan buatan CRM Pro Syariah.</p></div>
                    </div>
                    <div class="space-y-6">
                        <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <div class="flex justify-between items-center mb-3"><label class="text-[9px] font-black text-slate-700 uppercase tracking-widest">Model Pembelajaran AI</label><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">Active</span></div>
                            <select class="w-full bg-white border p-3 md:p-4 rounded-xl text-[10px] md:text-xs font-bold outline-none shadow-sm"><option>CRM Pro Syariah Real Estate Model v2.4 (Optimized)</option><option>General Sales Model v1.1</option></select>
                        </div>
                        <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label class="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-3 block">Temperature (Kreativitas vs Presisi)</label>
                            <input type="range" min="0" max="100" value="70" class="w-full accent-teal-600" />
                            <div class="flex justify-between text-[8px] md:text-[9px] font-bold text-slate-400 mt-2 uppercase"><span>Sangat Kaku / Matematis</span><span>Sangat Kreatif</span></div>
                        </div>
                        <button class="w-full py-4 bg-teal-950 text-white rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-teal-800 transition-colors">Simpan Konfigurasi</button>
                    </div>
                </div>
            </div>
        `;
        if(window.lucide) window.lucide.createIcons();
    }
}

// 6. AI CONTENT CALENDAR GENERATOR
export class ContentCalendarGeneratorComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        this.lastAIResult = null;
    }

    render() {
        if (!this.container) return;
        const savedInsight = this.state.developerSettings?.ai_persona_insight;
        const savedCalendar = this.state.developerSettings?.ai_content_calendar;

        if (!savedInsight) {
            this.container.innerHTML = `<div class="p-10 text-center text-orange-600 bg-orange-50 rounded-2xl border border-orange-200">
                <i data-lucide="alert-triangle" class="w-12 h-12 mx-auto mb-4"></i>
                <h3 class="font-bold">Konteks Persona Dibutuhkan</h3>
                <p class="text-sm mt-1">Silakan generate dan simpan hasil di menu <strong>Persona Insight</strong> terlebih dahulu sebelum membuat kalender konten.</p>
            </div>`;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        this.container.innerHTML = `
            <div class="max-w-7xl mx-auto space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Kolom Parameter -->
                    <div class="lg:col-span-1 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm self-start">
                        <h3 class="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest italic text-center">Parameter Kalender</h3>
                        <div class="space-y-5">
                            <div>
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Durasi Konten</label>
                                <div class="grid grid-cols-2 gap-2 mt-2">
                                    <button data-duration="7" class="duration-btn bg-teal-600 text-white shadow-lg">1 Pekan</button>
                                    <button data-duration="30" class="duration-btn">1 Bulan</button>
                                </div>
                            </div>
                             <div>
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Frekuensi Posting / Hari</label>
                                <div class="grid grid-cols-3 gap-2 mt-2">
                                    <button data-freq="1" class="freq-btn bg-teal-600 text-white shadow-lg">1x</button>
                                    <button data-freq="2" class="freq-btn">2x</button>
                                    <button data-freq="3" class="freq-btn">3x</button>
                                </div>
                            </div>
                            <div class="pt-4">
                                <button id="btn-generate-calendar" class="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all active:scale-95 flex items-center justify-center">
                                    <i data-lucide="calendar-days" class="w-4 h-4 mr-2"></i> Generate Jadwal
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Kolom Hasil -->
                    <div class="lg:col-span-2 bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl flex flex-col">
                        <p class="text-[9px] font-black text-teal-400 uppercase mb-4 tracking-widest flex items-center"><i data-lucide="sparkles" class="w-3.5 h-3.5 mr-2"></i> AI Content Calendar</p>
                        <div id="calendar-result-container" class="flex-1 min-h-[400px]">
                            <!-- Hasil akan dirender di sini -->
                        </div>
                        <button id="btn-save-calendar" class="hidden mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black text-[9px] uppercase shadow-lg transition-all active:scale-95 self-start">
                            <i data-lucide="save" class="w-3 h-3 inline mr-1.5"></i> Simpan Kalender Ini
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Apply shared button styles
        this.container.querySelectorAll('.duration-btn, .freq-btn').forEach(btn => {
            btn.classList.add('py-3', 'px-4', 'rounded-xl', 'font-black', 'text-[9px]', 'uppercase', 'tracking-widest', 'transition-all', 'border');
            if (!btn.classList.contains('bg-teal-600')) {
                btn.classList.add('text-slate-400', 'hover:bg-slate-50', 'border-slate-200');
            }
        });

        if (savedCalendar) {
            this.displayResult(savedCalendar, false);
        } else {
            this.container.querySelector('#calendar-result-container').innerHTML = `<div class="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                <i data-lucide="bot" class="w-8 h-8 mb-3"></i>
                <p class="text-xs italic font-medium">Pilih parameter dan klik generate.</p>
            </div>`;
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        if (window.lucide) window.lucide.createIcons();

        this.container.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleButton(e.currentTarget, '.duration-btn'));
        });

        this.container.querySelectorAll('.freq-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleButton(e.currentTarget, '.freq-btn'));
        });

        this.container.querySelector('#btn-generate-calendar').addEventListener('click', () => this.generate());
    }

    toggleButton(clickedBtn, groupSelector) {
        this.container.querySelectorAll(groupSelector).forEach(btn => {
            btn.classList.remove('bg-teal-600', 'text-white', 'shadow-lg');
            btn.classList.add('text-slate-400', 'hover:bg-slate-50', 'border-slate-200');
        });
        clickedBtn.classList.add('bg-teal-600', 'text-white', 'shadow-lg');
        clickedBtn.classList.remove('text-slate-400', 'hover:bg-slate-50', 'border-slate-200');
    }

    async generate() {
        const btn = this.container.querySelector('#btn-generate-calendar');
        const resContainer = this.container.querySelector('#calendar-result-container');

        const duration = this.container.querySelector('.duration-btn.bg-teal-600').dataset.duration;
        const freq = this.container.querySelector('.freq-btn.bg-teal-600').dataset.freq;
        const personaInsight = this.state.developerSettings?.ai_persona_insight;

        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Generating...`;
        btn.disabled = true;
        resContainer.innerHTML = `<div class="h-full flex flex-col items-center justify-center animate-pulse text-center px-4">
            <i data-lucide="cpu" class="w-8 h-8 text-teal-400 mb-3"></i>
            <p class="text-xs font-bold text-teal-300">AI sedang menyusun jadwal, mohon tunggu...</p>
        </div>`;
        if (window.lucide) window.lucide.createIcons();

        try {
            const prompt = `Anda adalah seorang Social Media Strategist ahli untuk agensi properti syariah.
            
**KONTEKS BUYER PERSONA:**
---
${personaInsight}
---

**TUGAS ANDA:**
Buatlah **Rencana Kalender Konten (Content Calendar)** yang detail dan terstruktur.

**PARAMETER:**
- **Durasi:** ${duration} hari.
- **Frekuensi:** ${freq} kali posting per hari.

**INSTRUKSI OUTPUT:**
Berikan output dalam format **JSON** yang bisa di-parse. Strukturnya harus berupa array of objects, di mana setiap object adalah satu jadwal post.
Setiap object harus memiliki key berikut: "day" (Hari ke-), "time_slot" (Slot Waktu ke-, jika >1x sehari), "content_pillar" (Pilih salah satu: Edukasi, Promosi, Interaksi, Testimoni), "topic_idea" (Ide topik konten yang spesifik dan menarik), "format" (Saran format: Reels, Carousel, Story, Single Image), dan "hook_suggestion" (Saran 1 kalimat untuk hook/caption pembuka).

Contoh 1 object:
{"day": 1, "time_slot": 1, "content_pillar": "Edukasi", "topic_idea": "3 Kesalahan Fatal Saat Beli Rumah Pertama", "format": "Reels", "hook_suggestion": "Jangan sampai kamu rugi ratusan juta karena 3 hal ini!"}

Pastikan jumlah object sesuai dengan (Durasi x Frekuensi). Jangan tambahkan teks atau penjelasan lain di luar format JSON.`;

            const response = await ApiService.generateAIContent(prompt);
            this.lastAIResult = response.result; // Simpan raw result untuk di-save
            this.displayResult(response.result, true);

        } catch (error) {
            resContainer.innerHTML = `<div class="text-red-400 text-xs">Error: ${error.message}</div>`;
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    displayResult(rawJson, isNewResult) {
        const resContainer = this.container.querySelector('#calendar-result-container');
        const saveButton = this.container.querySelector('#btn-save-calendar');
        
        try {
            // Bersihkan jika ada markdown ```json
            const cleanJson = rawJson.replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanJson);

            const tableRows = data.map(item => `
                <tr class="border-b border-slate-700/50 hover:bg-slate-800/50">
                    <td class="p-3 text-center">${item.day}</td>
                    <td class="p-3">${item.topic_idea}</td>
                    <td class="p-3 text-center"><span class="px-2 py-0.5 bg-teal-800 text-teal-200 rounded-full text-[8px] font-black">${item.content_pillar}</span></td>
                    <td class="p-3 text-center">${item.format}</td>
                </tr>
            `).join('');

            resContainer.innerHTML = `
                <div class="w-full h-full bg-white/5 p-1 rounded-2xl border border-white/5 text-left custom-scrollbar overflow-y-auto">
                    <table class="w-full text-xs text-slate-300">
                        <thead class="sticky top-0 bg-slate-900">
                            <tr class="text-[9px] uppercase font-black text-slate-400">
                                <th class="p-3 text-center">Hari</th>
                                <th class="p-3">Ide Topik</th>
                                <th class="p-3 text-center">Pilar</th>
                                <th class="p-3 text-center">Format</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            `;
        } catch (e) {
            console.error("Gagal parsing JSON kalender:", e);
            resContainer.innerHTML = `<div class="w-full h-full bg-white/5 p-4 rounded-2xl border border-white/5 text-left custom-scrollbar overflow-y-auto whitespace-pre-wrap">${rawJson}</div>`;
        }

        if (isNewResult) {
            saveButton.classList.remove('hidden');
            saveButton.onclick = () => this.saveResult();
        } else {
            saveButton.classList.add('hidden');
        }
    }

    async saveResult() {
        const saveButton = this.container.querySelector('#btn-save-calendar');
        const originalContent = saveButton.innerHTML;
        saveButton.innerText = 'Menyimpan...';
        saveButton.disabled = true;

        const formData = new FormData();
        formData.append('developer_id', this.state.currentUser.developer_id);
        formData.append('user_id', this.state.currentUser.id);
        
        const encodedCalendar = btoa(unescape(encodeURIComponent(this.lastAIResult)));
        formData.append('ai_content_calendar', encodedCalendar);

        try {
            // Gunakan path relative 'api/' yang lebih aman
            const response = await fetch('api/save_developer_settings.php', { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Server Error: ${response.status}`);
            alert('Kalender konten berhasil disimpan!');
            saveButton.classList.add('hidden');
            if (!this.state.developerSettings) this.state.developerSettings = {};
            this.state.developerSettings.ai_content_calendar = this.lastAIResult;
        } catch (error) {
            alert('Gagal menyimpan kalender: ' + error.message);
            saveButton.innerHTML = originalContent;
            saveButton.disabled = false;
        }
    }
}