import { ApiService } from '../api.js';

export class SettingsComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        
        // Bersihkan interval polling lama jika tersisa
        if (window.waPollingInterval) {
            clearInterval(window.waPollingInterval);
            window.waPollingInterval = null;
        }
    }

    render() {
        if (!this.container) return;
        
        // Ambil data setting yang sudah tersimpan di state (dari login/refresh)
        const settings = this.state.developerSettings || {};

        this.container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-8">
                <!-- Header Settings -->
                <div class="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center text-center md:text-left">
                    <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#2845D6] mb-4 md:mb-0 md:mr-6 shrink-0">
                        <i data-lucide="settings-2" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h3 class="text-lg md:text-xl font-black text-slate-800 uppercase tracking-widest italic">Pengaturan Sistem</h3>
                        <p class="text-xs text-slate-500 font-medium mt-1">Sesuaikan identitas aplikasi (White Label) dan konfigurasi dasar sistem Anda.</p>
                    </div>
                </div>

                <!-- Form Konfigurasi -->
                <form id="settings-form" class="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-lg space-y-6">
                    
                    <!-- 1. Identitas Branding -->
                    <div class="space-y-4 border-b border-slate-100 pb-6">
                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Branding Perusahaan</h4>
                        
                        <div class="flex flex-col md:flex-row gap-6 items-start">
                            <div class="w-full md:w-1/3 text-center">
                                <div class="relative w-32 h-32 mx-auto bg-slate-50 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group">
                                    <img id="logo-preview" src="${settings.logo_url || ''}" class="${settings.logo_url ? '' : 'hidden'} w-full h-full object-cover" />
                                    <div id="logo-placeholder" class="${settings.logo_url ? 'hidden' : ''} text-slate-400 text-[10px] font-bold uppercase text-center p-2">
                                        <i data-lucide="upload-cloud" class="w-6 h-6 mx-auto mb-1"></i> Upload Logo
                                    </div>
                                    <input type="file" name="logo" accept="image/*" id="logo-input" class="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <p class="text-[9px] text-slate-400 mt-2 italic">Klik lingkaran untuk ganti logo. Max 2MB.</p>
                            </div>
                            
                            <div class="w-full md:w-2/3 space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Aplikasi (Sidebar)</label>
                                    <input type="text" name="app_name" value="${settings.app_name || ''}" placeholder="Contoh: PROPERTY BOS" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Notifikasi Laporan</label>
                                    <input type="email" name="notification_email" value="${settings.notification_email || ''}" placeholder="email@perusahaan.com" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Warna Utama Aplikasi</label>
                                        <div class="flex items-center gap-2">
                                            <input type="color" name="theme_color" value="${settings.theme_color || '#2845D6'}" class="w-10 h-10 border border-slate-200 rounded-xl p-0.5 cursor-pointer bg-white" />
                                            <input type="text" id="theme_color_text" value="${settings.theme_color || '#2845D6'}" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none font-mono" placeholder="#2845D6" />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Warna Sidebar</label>
                                        <div class="flex items-center gap-2">
                                            <input type="color" name="sidebar_color" value="${settings.sidebar_color || '#1e3a8a'}" class="w-10 h-10 border border-slate-200 rounded-xl p-0.5 cursor-pointer bg-white" />
                                            <input type="text" id="sidebar_color_text" value="${settings.sidebar_color || '#1e3a8a'}" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none font-mono" placeholder="#1e3a8a" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. System Control -->
                    <div class="space-y-4 border-b border-slate-100 pb-6">
                         <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Kontrol Sistem</h4>
                         <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <p class="text-xs font-bold text-slate-700">Maintenance Mode</p>
                                <p class="text-[9px] text-slate-500">Jika aktif, hanya Developer & Admin yang bisa login.</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="maintenance_mode" class="sr-only peer" ${settings.maintenance_mode == 1 ? 'checked' : ''}>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                         </div>
                    </div>

                    <!-- 3. Konfigurasi CS AI & WhatsApp Gateway -->
                    <div class="space-y-4 pt-2">
                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Integrasi Asisten CS AI</h4>
                        
                        <div class="grid grid-cols-1 ${this.state.currentUser.role === 'Super Admin' ? 'md:grid-cols-2' : ''} gap-6">
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor WhatsApp Gateway</label>
                                <input type="text" name="wa_number" id="wa_number_input" value="${settings.wa_number || ''}" placeholder="Contoh: 081234567890" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" ${this.state.currentUser.role !== 'Super Admin' && settings.wa_number ? 'readonly' : ''} />
                                <p class="text-[9px] text-slate-400 mt-1">Nomor WhatsApp yang digunakan untuk merespons chat asisten AI.</p>
                            </div>
                            
                            ${this.state.currentUser.role === 'Super Admin' ? `
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fonnte API Token</label>
                                <input type="password" name="fonnte_token" value="${settings.fonnte_token || ''}" placeholder="Masukkan Fonnte Token Anda" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                                <p class="text-[9px] text-slate-400 mt-1">Token API Fonnte (Hanya terlihat oleh Super Admin).</p>
                            </div>
                            ` : `
                            <input type="hidden" name="fonnte_token" value="${settings.fonnte_token || ''}" />
                            `}
                        </div>

                        <!-- Panel Koneksi WhatsApp (Hanya untuk Tenant / Developer) -->
                        ${this.state.currentUser.role !== 'Super Admin' ? `
                        <div id="wa-connection-panel" class="mt-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 border-dashed">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                                <div>
                                    <h5 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Status WhatsApp Gateway</h5>
                                    <p class="text-[10px] text-slate-500 mt-0.5">Sambungkan nomor Anda agar AI dapat mengirim balasan otomatis.</p>
                                </div>
                                <div id="wa-status-badge">
                                    <span class="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-slate-200 text-slate-500">
                                        Memeriksa...
                                    </span>
                                </div>
                            </div>
                            
                            <div id="wa-connection-actions" class="mt-6 hidden">
                                <!-- Konten dinamis diisi oleh checkWhatsAppStatus() -->
                            </div>
                        </div>
                        ` : ''}

                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Instruksi Asisten CS AI (Prompt Training)</label>
                            <textarea name="ai_cs_instruction" rows="4" placeholder="Contoh: Anda adalah asisten CS untuk Royal Syariah Residence. Jawab ramah dan berfokus pada promo free DP..." class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]">${settings.ai_cs_instruction || ''}</textarea>
                            <p class="text-[9px] text-slate-400 mt-1">Tuliskan panduan/instruksi agar asisten AI Anda dapat melayani calon pembeli secara akurat.</p>
                        </div>
                        
                        ${this.state.currentUser.role === 'Super Admin' ? `
                        <div class="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4 flex gap-3 text-left">
                            <i data-lucide="info" class="w-5 h-5 text-teal-600 shrink-0 mt-0.5"></i>
                            <div>
                                <p class="text-xs font-bold text-teal-800">Webhook Integration URL (Super Admin Info):</p>
                                <p class="text-[10px] text-teal-700 mt-1">
                                    Copy URL berikut dan tempelkan ke kolom <strong>Webhook</strong> pada device Anda di dashboard Fonnte:<br/>
                                    <code class="bg-teal-100 px-2 py-1 rounded text-teal-900 font-mono select-all select-text inline-block mt-1 font-semibold">${window.location.origin}/api/whatsapp_webhook.php</code>
                                </p>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="pt-4">
                        <button type="submit" id="btn-save-settings" class="w-full py-4 bg-[#2845D6] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95">Simpan Pengaturan</button>
                    </div>
                </form>
            </div>
        `;

        this.attachEventListeners();
        if (window.lucide) window.lucide.createIcons();

        if (this.state.currentUser.role !== 'Super Admin') {
            this.checkWhatsAppStatus();
        }
    }

    attachEventListeners() {
        const form = this.container.querySelector('#settings-form');
        const logoInput = this.container.querySelector('#logo-input');
        const logoPreview = this.container.querySelector('#logo-preview');
        const logoPlaceholder = this.container.querySelector('#logo-placeholder');

        const themeColorPicker = form.querySelector('input[name="theme_color"]');
        const themeColorText = form.querySelector('#theme_color_text');
        const sidebarColorPicker = form.querySelector('input[name="sidebar_color"]');
        const sidebarColorText = form.querySelector('#sidebar_color_text');

        if (themeColorPicker && themeColorText) {
            themeColorPicker.addEventListener('input', (e) => themeColorText.value = e.target.value.toUpperCase());
            themeColorText.addEventListener('input', (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    themeColorPicker.value = e.target.value;
                }
            });
        }

        if (sidebarColorPicker && sidebarColorText) {
            sidebarColorPicker.addEventListener('input', (e) => sidebarColorText.value = e.target.value.toUpperCase());
            sidebarColorText.addEventListener('input', (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    sidebarColorPicker.value = e.target.value;
                }
            });
        }

        // Preview Logo saat dipilih
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    logoPreview.src = e.target.result;
                    logoPreview.classList.remove('hidden');
                    logoPlaceholder.classList.add('hidden');
                }
                reader.readAsDataURL(file);
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('#btn-save-settings');
            const originalText = btn.innerText;
            btn.innerText = 'Menyimpan...';
            btn.disabled = true;

            const formData = new FormData(form);
            formData.append('developer_id', this.state.currentUser.developer_id);
            formData.append('user_id', this.state.currentUser.id);
            
            // Kirim URL logo lama jika tidak ada upload baru, agar tidak terhapus di server
            if (this.state.developerSettings?.logo_url) {
                formData.append('existing_logo_url', this.state.developerSettings.logo_url);
            }

            try {
                // Karena pakai FormData (upload file), jangan set Content-Type header manual
                // Gunakan fetch langsung agar browser yang atur Boundary
                const response = await fetch('api/save_developer_settings.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (!response.ok) throw new Error(result.message || 'Gagal menyimpan');

                alert('Pengaturan berhasil disimpan! Halaman akan dimuat ulang.');
                
                // Update local state jika perlu atau reload
                window.location.reload(); 

            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    async checkWhatsAppStatus() {
        const badge = this.container.querySelector('#wa-status-badge');
        const actions = this.container.querySelector('#wa-connection-actions');
        if (!badge || !actions) return;

        try {
            const response = await fetch('api/check_whatsapp_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ developer_id: this.state.currentUser.developer_id })
            });
            const result = await response.json();
            if (!result.status) throw new Error(result.message);

            const settings = this.state.developerSettings || {};

            if (result.device_status === 'connect') {
                badge.innerHTML = `<span class="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>TERHUBUNG</span>`;
                actions.innerHTML = `
                    <div class="space-y-3 text-left">
                        <p class="text-xs text-slate-600">
                            WhatsApp Gateway Anda saat ini menggunakan nomor: <strong class="text-slate-800 font-mono font-bold">${settings.wa_number || ''}</strong>
                        </p>
                        <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-800 font-medium">
                            Layanan Asisten CS AI aktif dan siap merespons chat masuk secara otomatis pada nomor di atas.
                        </div>
                        <button type="button" id="btn-disconnect-wa" class="mt-2 py-2.5 px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-all font-bold">
                            Putuskan Koneksi / Ganti Nomor
                        </button>
                    </div>
                `;
                actions.classList.remove('hidden');

                const btnDisconnect = actions.querySelector('#btn-disconnect-wa');
                if (btnDisconnect) {
                    btnDisconnect.addEventListener('click', async () => {
                        if (confirm('Apakah Anda yakin ingin memutuskan koneksi WhatsApp ini? Fitur CS AI tidak akan berfungsi sampai Anda menghubungkan kembali nomor WhatsApp.')) {
                            btnDisconnect.disabled = true;
                            btnDisconnect.innerText = 'Memutuskan...';
                            try {
                                const disRes = await fetch('api/disconnect_whatsapp.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ developer_id: this.state.currentUser.developer_id })
                                });
                                const disResult = await disRes.json();
                                if (!disRes.ok) throw new Error(disResult.message);
                                alert('WhatsApp berhasil diputuskan!');
                                window.location.reload();
                            } catch (e) {
                                alert('Error: ' + e.message);
                                btnDisconnect.disabled = false;
                                btnDisconnect.innerText = 'Putuskan Koneksi / Ganti Nomor';
                            }
                        }
                    });
                }
            } else {
                badge.innerHTML = `<span class="bg-red-50 text-red-600 border border-red-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full font-bold">TERPUTUS</span>`;
                
                if (!settings.wa_number) {
                    actions.innerHTML = `
                        <div class="space-y-2 text-slate-500 text-xs text-left">
                            <p class="font-bold text-slate-600">⚠️ Nomor WhatsApp Gateway belum diatur.</p>
                            <p class="text-[10px] text-slate-400">Silakan isi kolom <strong>Nomor WhatsApp Gateway</strong> di atas terlebih dahulu, kemudian klik <strong>Simpan Pengaturan</strong> agar sistem dapat memproses koneksi.</p>
                        </div>
                    `;
                } else {
                    actions.innerHTML = `
                        <div class="space-y-3 text-left">
                            <p class="text-xs text-slate-600">
                                Nomor WhatsApp terdaftar: <strong class="text-slate-800 font-mono font-bold">${settings.wa_number || ''}</strong>
                            </p>
                            <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 font-medium">
                                WhatsApp belum terhubung. Silakan klik tombol di bawah untuk membuat sesi koneksi dan melakukan scan QR Code.
                            </div>
                            <button type="button" id="btn-connect-wa" class="py-2.5 px-5 bg-[#2845D6] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all font-bold">
                                Hubungkan WhatsApp via QR Code
                            </button>
                        </div>
                    `;
                    
                    const btnConnect = actions.querySelector('#btn-connect-wa');
                    if (btnConnect) {
                        btnConnect.addEventListener('click', async () => {
                            btnConnect.disabled = true;
                            btnConnect.innerText = 'Menyiapkan QR Code...';
                            try {
                                const qrRes = await fetch('api/get_whatsapp_qr.php', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        developer_id: this.state.currentUser.developer_id,
                                        wa_number: settings.wa_number
                                    })
                                });
                                const qrResult = await qrRes.json();
                                if (!qrRes.ok) throw new Error(qrResult.message || 'Gagal mengambil QR Code');

                                if (qrResult.already_connected) {
                                    alert('WhatsApp Anda sudah terhubung!');
                                    window.location.reload();
                                    return;
                                }

                                // Tampilkan QR Code
                                badge.innerHTML = `<span class="bg-yellow-50 text-yellow-600 border border-yellow-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full font-bold">MENUNGGU SCAN</span>`;
                                actions.innerHTML = `
                                    <div class="space-y-4 text-center">
                                        <div class="bg-white p-4 inline-block border border-slate-200 rounded-2xl shadow-sm">
                                            <img src="${qrResult.qr}" class="w-48 h-48 mx-auto" />
                                        </div>
                                        <div class="max-w-md mx-auto">
                                            <p class="text-xs font-bold text-slate-700">Tautkan Perangkat WhatsApp Anda</p>
                                            <ol class="text-[10px] text-slate-500 text-left list-decimal list-inside mt-2 space-y-1 mx-auto max-w-[280px]">
                                                <li>Buka aplikasi WhatsApp di HP Anda</li>
                                                <li>Ketuk <strong>Menu</strong> atau <strong>Pengaturan</strong></li>
                                                <li>Pilih <strong>Perangkat Tertaut (Linked Devices)</strong></li>
                                                <li>Ketuk <strong>Tautkan Perangkat</strong> dan scan QR di atas</li>
                                            </ol>
                                        </div>
                                        <p class="text-[10px] text-slate-400 italic mt-2">Menunggu scan... QR code diperbarui secara otomatis di HP</p>
                                        <button type="button" id="btn-cancel-connect" class="py-2 px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all font-bold mt-2">
                                            Batalkan
                                        </button>
                                    </div>
                                `;

                                this.startPollingStatus();

                                const btnCancel = actions.querySelector('#btn-cancel-connect');
                                if (btnCancel) {
                                    btnCancel.addEventListener('click', () => {
                                        this.stopPollingStatus();
                                        this.checkWhatsAppStatus();
                                    });
                                }

                            } catch (err) {
                                alert('Error: ' + err.message);
                                btnConnect.disabled = false;
                                btnConnect.innerText = 'Hubungkan WhatsApp via QR Code';
                            }
                        });
                    }
                }
                actions.classList.remove('hidden');
            }
        } catch (e) {
            badge.innerHTML = `<span class="bg-red-50 text-red-600 border border-red-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full font-bold">ERROR STATUS</span>`;
            actions.innerHTML = `<p class="text-xs text-red-500 font-bold text-left">Gagal memuat status WhatsApp: ${e.message}</p>`;
            actions.classList.remove('hidden');
        }
    }

    startPollingStatus() {
        this.stopPollingStatus();
        let counter = 0;
        window.waPollingInterval = setInterval(async () => {
            try {
                // 1. Cek status koneksi
                const response = await fetch('api/check_whatsapp_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ developer_id: this.state.currentUser.developer_id })
                });
                const result = await response.json();
                if (result.status && result.device_status === 'connect') {
                    this.stopPollingStatus();
                    alert('WhatsApp berhasil terhubung! Layanan CS AI kini aktif.');
                    window.location.reload();
                    return;
                }

                // 2. Setiap 20 detik (4 x 5 detik), refresh QR Code agar tidak expired
                counter++;
                if (counter >= 4) {
                    counter = 0;
                    const settings = this.state.developerSettings || {};
                    const qrRes = await fetch('api/get_whatsapp_qr.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            developer_id: this.state.currentUser.developer_id,
                            wa_number: settings.wa_number
                        })
                    });
                    const qrResult = await qrRes.json();
                    if (qrRes.ok && qrResult.qr) {
                        const img = this.container.querySelector('#wa-connection-actions img');
                        if (img) {
                            img.src = qrResult.qr;
                        }
                    }
                }
            } catch (e) {
                console.error("Polling/Refresh error:", e);
            }
        }, 5000);
    }

    stopPollingStatus() {
        if (window.waPollingInterval) {
            clearInterval(window.waPollingInterval);
            window.waPollingInterval = null;
        }
    }
}