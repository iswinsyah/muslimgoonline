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

// 2. CREATIVE SUITE
export class CreativeSuiteComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        this.activeMode = 'caption';
        this.lastAIResults = {}; // { caption: "...", visual: "...", video: "..." }
        this.modes = {
            caption: {
                label: 'Caption & Hashtag',
                icon: 'file-text',
                db_key: 'ai_creative_caption',
                prompt_instruction: "Buatlah **Copywriting Lengkap** untuk caption Instagram/Facebook yang sangat persuasif, terdiri dari: \n1. **Headline** yang menarik perhatian. \n2. **Body Copy** yang menjelaskan keuntungan sesuai persona. \n3. **Call to Action (CTA)** yang kuat. \n4. Sertakan juga **10-15 rekomendasi hashtag** yang relevan dengan topik dan target market."
            },
            visual: {
                label: 'Visual Idea',
                icon: 'image',
                db_key: 'ai_creative_visual',
                prompt_instruction: "Berikan **Ide Konsep Visual** untuk postingan Instagram (bisa carousel atau single image). Jelaskan secara detail: \n1. **Gambar Utama/Slide 1:** Deskripsi visual dan teks overlay. \n2. **Gambar/Slide Berikutnya:** Deskripsi visual dan poin-poin penting. \n3. **Teks untuk Caption:** Tulis caption singkat yang sesuai dengan visualnya."
            },
            video: {
                label: 'Video Script',
                icon: 'video',
                db_key: 'ai_creative_video',
                prompt_instruction: "Tulis **Naskah/Script Video Pendek** (TikTok/Reels) yang lengkap, mencakup: \n1. **Hook (3 detik pertama):** Kalimat atau adegan pembuka yang membuat orang berhenti scroll. \n2. **Isi Video:** Poin-poin utama yang disampaikan (bisa berupa narasi atau teks di layar). \n3. **Visual/Adegan:** Deskripsi singkat adegan yang harus direkam. \n4. **Call to Action (CTA):** Ajakan di akhir video."
            }
        };
    }

    render() {
        if (!this.container) return;

        const tabButtons = Object.keys(this.modes).map(key => {
            const mode = this.modes[key];
            return `<button data-mode="${key}" class="creative-tab-btn shrink-0 snap-center min-w-[140px] flex-1 py-3 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center">
                        <i data-lucide="${mode.icon}" class="w-3.5 h-3.5 mr-2"></i> ${mode.label}
                    </button>`;
        }).join('');

        this.container.innerHTML = `
            <div class="max-w-5xl mx-auto space-y-6">
                <div id="creative-tabs-container" class="flex space-x-2 md:space-x-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto hide-scroll shrink-0 snap-x">
                    ${tabButtons}
                </div>
                <div id="creative-content-area">
                    <!-- Konten tab akan dirender di sini -->
                </div>
            </div>
        `;

        this.container.querySelector('#creative-tabs-container').addEventListener('click', (e) => {
            const button = e.target.closest('.creative-tab-btn');
            if (button && button.dataset.mode) {
                this.switchMode(button.dataset.mode);
            }
        });

        this.switchMode(this.activeMode); // Render tab awal
    }

    switchMode(modeKey) {
        this.activeMode = modeKey;

        // Update style tombol tab
        this.container.querySelectorAll('.creative-tab-btn').forEach(btn => {
            if (btn.dataset.mode === modeKey) {
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
        const contentArea = this.container.querySelector('#creative-content-area');
        const config = this.modes[this.activeMode];
        const savedData = this.state.developerSettings?.[config.db_key];

        contentArea.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in">
                <div class="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 class="text-xs md:text-sm font-black text-slate-800 mb-6 uppercase tracking-widest italic text-center md:text-left">AI Content Parameter</h3>
                    <div class="space-y-4">
                        <textarea id="topic-from-calendar" placeholder="Paste topik dari Kalender Konten di sini..." class="w-full bg-teal-50 border-2 border-dashed border-teal-200 rounded-2xl p-4 h-24 text-xs font-medium resize-none focus:ring-2 focus:ring-teal-500 outline-none shadow-inner"></textarea>
                        <select id="creative-angle" class="w-full bg-slate-50 border p-4 rounded-2xl text-[10px] font-bold outline-none"><option>Angle: Syariah Murni Tanpa Sita</option><option>Angle: Rumah Pertama Milenial</option><option>Angle: Investasi Properti Menguntungkan</option></select>
                        <textarea id="creative-input" placeholder="Detail TAMBAHAN: Poin promo, spesifikasi unit, dll..." class="w-full bg-slate-50 border rounded-2xl p-4 h-32 md:h-40 text-xs font-medium resize-none focus:ring-2 focus:ring-teal-500 outline-none shadow-inner"></textarea>
                        <button id="btn-generate-creative" class="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all active:scale-95">Generate ${config.label}</button>
                    </div>
                </div>
                <div class="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl flex flex-col min-h-[300px] md:min-h-[400px]">
                    <p class="text-[9px] font-black text-teal-400 uppercase mb-4 tracking-widest flex items-center"><i data-lucide="sparkles" class="w-3.5 h-3.5 mr-2"></i> AI Result: ${config.label}</p>
                    <div id="creative-result" class="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <!-- Hasil AI atau data tersimpan -->
                    </div>
                    <button id="btn-save-creative" class="hidden mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-black text-[9px] uppercase shadow-lg transition-all active:scale-95 self-start">
                        <i data-lucide="save" class="w-3 h-3 inline mr-1.5"></i> Simpan Hasil Ini
                    </button>
                </div>
            </div>
        `;

        const resultContainer = contentArea.querySelector('#creative-result');
        if (savedData) {
            resultContainer.innerHTML = `<div class="w-full h-full bg-white/5 p-4 md:p-6 rounded-2xl text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap border border-white/5 text-left custom-scrollbar overflow-y-auto">${savedData}</div>`;
        } else {
            resultContainer.innerHTML = `<div class="opacity-30"><i data-lucide="bot" class="w-8 h-8 mb-3 mx-auto"></i><p class="text-xs italic font-medium">Masukkan parameter dan klik generate.</p></div>`;
        }

        // Attach listeners for the new elements
        contentArea.querySelector('#btn-generate-creative').addEventListener('click', () => this.generate());
        contentArea.querySelector('#btn-save-creative').addEventListener('click', () => this.saveResult());

        if (window.lucide) window.lucide.createIcons();
    }

    async generate() {
        const contentArea = this.container.querySelector('#creative-content-area');
        const btn = contentArea.querySelector('#btn-generate-creative');
        const resContainer = contentArea.querySelector('#creative-result');
        const saveBtn = contentArea.querySelector('#btn-save-creative');

        const topic = contentArea.querySelector('#topic-from-calendar').value;
        const angle = contentArea.querySelector('#creative-angle').value;
        const input = contentArea.querySelector('#creative-input').value;

        if (!topic) {
            alert('Silakan paste topik dari Kalender Konten terlebih dahulu.');
            return;
        }

        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Processing...`;
        btn.disabled = true;
        saveBtn.classList.add('hidden');
        resContainer.innerHTML = `<div class="animate-pulse flex flex-col items-center"><i data-lucide="cpu" class="w-8 h-8 text-teal-400 mb-3"></i><p class="text-[10px] font-black uppercase tracking-widest">Merangkai...</p></div>`;
        if (window.lucide) window.lucide.createIcons();

        try {
            const personaInsight = this.state.developerSettings?.ai_persona_insight || 'Tidak ada data persona. Asumsikan target market umum untuk properti syariah.';
            const config = this.modes[this.activeMode];

            const prompt = `Anda adalah seorang Creative Director ahli untuk agensi properti syariah.
**KONTEKS BUYER PERSONA:**
---
${personaInsight}
---
**TUGAS ANDA:**
Buat konten kreatif untuk properti syariah dengan detail sebagai berikut:
- **Topik Utama:** "${topic}"
- **Angle/Sudut Pandang:** ${angle}
- **Detail Tambahan dari User:** ${input || 'Tidak ada.'}
**INSTRUKSI OUTPUT SPESIFIK:**
${config.prompt_instruction}`;

            const response = await ApiService.generateAIContent(prompt);
            this.lastAIResults[this.activeMode] = response.result;

            resContainer.innerHTML = `<div class="w-full h-full bg-white/5 p-4 md:p-6 rounded-2xl text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap border border-white/5 text-left custom-scrollbar overflow-y-auto">${response.result}</div>`;
            saveBtn.classList.remove('hidden');

        } catch (error) {
            resContainer.innerHTML = `<div class="text-red-400 text-xs">Error: ${error.message}</div>`;
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    async saveResult() {
        const contentArea = this.container.querySelector('#creative-content-area');
        const saveBtn = contentArea.querySelector('#btn-save-creative');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = 'Menyimpan...';
        saveBtn.disabled = true;

        const config = this.modes[this.activeMode];
        const resultToSave = this.lastAIResults[this.activeMode];

        if (!resultToSave) {
            alert('Tidak ada hasil untuk disimpan.');
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            return;
        }

        const formData = new FormData();
        formData.append('developer_id', this.state.currentUser.developer_id);
        formData.append('user_id', this.state.currentUser.id);
        
        const encodedResult = btoa(unescape(encodeURIComponent(resultToSave)));
        formData.append(config.db_key, encodedResult);

        try {
            const response = await fetch('api/save_developer_settings.php', { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Server Error: ${response.status}`);
            const result = await response.json();
            
            alert(result.message || 'Hasil berhasil disimpan!');
            saveBtn.classList.add('hidden');

            // Update state global
            if (!this.state.developerSettings) this.state.developerSettings = {};
            this.state.developerSettings[config.db_key] = resultToSave;

        } catch (error) {
            alert('Gagal menyimpan: ' + error.message);
            saveBtn.innerHTML = originalText;
        } finally {
            saveBtn.disabled = false;
        }
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