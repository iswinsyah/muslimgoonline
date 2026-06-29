// App Version: 1.0.1 - Triggering Deployment to crmprosyariah.online
// App Version: 1.0.5 - Force Sync Menu Gudang Token and Team Management
import { ApiService } from './api.js';
import { UI } from './ui.js';
import { PipelineComponent } from './components/pipeline.js';
import { PortfolioComponent } from './components/portfolio.js';
import { ReportingComponent } from './components/reporting.js';
import { ClientManagementComponent } from './components/client_management.js';
import { LeadAnalyzerComponent, CreativeSuiteComponent, ObjectionGenComponent, PersonaInsightComponent, AiEngineConfigComponent, ContentCalendarGeneratorComponent } from './components/ai_features.js?v=1.1.4';
import { TasksComponent } from './components/tasks.js';
import { CalendarComponent } from './components/calendar.js';
import { ValidationComponent } from './components/validation.js';
import { MenuManagementComponent } from './components/menu_management.js';
import { ImpersonationComponent } from './components/impersonation.js';
import { SettingsComponent } from './components/settings.js?v=1.1.0';
import { TeamManagementComponent } from './components/team_management.js';
import { BuyerListComponent } from './components/buyer_list.js';
import { TokenPoolComponent } from './components/token_pool.js';
import { BusinessConsultingComponent } from './components/business_consulting.js?v=1.1.2';

// --- Cek Sesi Login ---
const loggedInUser = JSON.parse(localStorage.getItem('mgo_user'));
if (!loggedInUser) {
    window.location.href = 'login.html';
} else {
    const state = {
        currentUser: loggedInUser,
        currentRole: loggedInUser.role, // Ambil role dari data login
        currentTab: 'pipeline',
        leads: [],
        menus: [], // Menu akan dimuat secara dinamis
        developerSettings: null // Untuk menyimpan info branding
    };

    const ui = new UI();
    let pipelineComponent = null;
    let teamManagementComponent = null;
    let portfolioComponent = null;
    let reportingComponent = null;
    let clientManagementComponent = null;
    let leadAnalyzerComponent = null;
    let creativeSuiteComponent = null;
    let objectionGenComponent = null;
    let personaInsightComponent = null;
    let contentCalendarGeneratorComponent = null;
    let aiEngineConfigComponent = null;
    let tasksComponent = null;
    let calendarComponent = null;
    let validationComponent = null;
    let settingsComponent = null;
    let menuManagementComponent = null;
    let impersonationComponent = null;
    let buyerListComponent = null;
    let tokenPoolComponent = null;
    let businessConsultingComponent = null;

    document.addEventListener('DOMContentLoaded', async () => {
        await initializeApp();
    });

    async function initializeApp() {
        checkImpersonation();
        
        // 1. Ambil info branding & status
        await fetchDeveloperSettings().catch(e => console.warn("CRM Pro: Branding belum tersedia.", e));

        setupUserUI();

        try {
            // 2. Ambil menu dinamis dari API
            let fetchedMenus = [];
            try {
                fetchedMenus = await ApiService.get(`get_menus.php?v=${Date.now()}`);
                
                // Normalisasi data dari database (allowed_roles string -> roles Array)
                fetchedMenus = Array.isArray(fetchedMenus) ? fetchedMenus : (fetchedMenus.data || []);
                fetchedMenus = fetchedMenus.map(m => {
                    let r = m.roles || m.allowed_roles || ['Super Admin'];
                    if (typeof r === 'string') {
                        try { r = JSON.parse(r); } catch(e) { r = ['Super Admin']; }
                    }
                    return { ...m, roles: r };
                });
                if (fetchedMenus.length === 0) {
                    console.warn("CRM Pro: Menu di database kosong, mengalihkan ke menu default.");
                    fetchedMenus = getDefaultMenus(state.currentRole);
                }
            } catch (error) {
                console.error("CRM Pro: Gagal memuat menu dari server. Mengalihkan ke menu default.", error);
                fetchedMenus = getDefaultMenus(state.currentRole);
            }

            state.menus = Array.isArray(fetchedMenus) ? assignCategoriesToMenus(fetchedMenus) : [];

            // 3. Render UI Dasar
            setupEventListeners();
            renderSidebar();
            applyBranding(); 
            handleRouting();

            // 4. Ambil data leads (Ini yang biasanya 403 jika Pending)
            try {
                await refreshData();
            } catch (e) { 
                console.warn("CRM Pro: Data leads tidak dapat dimuat (Status mungkin Pending)"); 
            }
            
            console.log("CRM Pro: Aplikasi siap digunakan!");
        } catch (error) {
            console.error("CRM Pro Error:", error);
            document.getElementById('main-content').innerHTML = `<div class="p-10 text-center text-red-500">Gagal memuat konfigurasi aplikasi. Coba muat ulang halaman.</div>`;
        }
    }

    async function handleRouting() {
        const hash = window.location.hash.substring(1);
        
        const isPending = state.currentUser.role !== 'Super Admin' && 
                          state.developerSettings && 
                          state.developerSettings.status_langganan === 'Pending';

        if (isPending) {
            console.log("Tenant pending, force to settings.");
            window.location.hash = 'settings';
            switchTab('settings');
        } else if (hash === 'settings' && state.currentUser.role === 'Developer' && state.currentUser.is_first_login) {
            console.log("Developer login pertama, arahkan ke settings (Menu Management).");
            switchTab('settings'); // Ini akan memuat MenuManagementComponent
            await markFirstLoginAsComplete();
        } else {
            switchTab(hash || 'pipeline'); // Halaman default
        }

        // Dengarkan perubahan hash untuk navigasi tanpa reload halaman
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.substring(1);
            const isPendingChange = state.currentUser.role !== 'Super Admin' && 
                                    state.developerSettings && 
                                    state.developerSettings.status_langganan === 'Pending';
            if (isPendingChange) {
                window.location.hash = 'settings';
                switchTab('settings');
            } else {
                switchTab(newHash || 'pipeline');
            }
        });
    }

    function checkImpersonation() {
        const superAdminSession = localStorage.getItem('mgo_super_admin_session');
        if (superAdminSession) {
            const banner = document.createElement('div');
            banner.className = 'bg-[#2845D6] text-white text-xs font-bold p-2 text-center fixed top-0 left-0 right-0 z-[200]';
            banner.innerHTML = `
                Anda sedang login sebagai <strong>${state.currentUser.nama_user}</strong>. 
                <button id="exit-impersonation" class="ml-4 font-black underline hover:text-blue-200">Kembali ke Akun Super Admin</button>
            `;
            document.body.prepend(banner);
            document.body.style.paddingTop = '32px';

            document.getElementById('exit-impersonation').addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin kembali ke akun Super Admin?')) {
                    localStorage.setItem('mgo_user', superAdminSession);
                    localStorage.removeItem('mgo_super_admin_session');
                    window.location.href = 'index.php';
                }
            });
        }
    }

    async function fetchDeveloperSettings() {
        if (state.currentUser.role === 'Super Admin' || !state.currentUser.developer_id) {
            return; // Tidak ada branding untuk Super Admin atau user tanpa developer
        }
        try {
            state.developerSettings = await ApiService.get(`get_developer_settings.php?developer_id=${state.currentUser.developer_id}`);
            applyBranding();
        } catch (error) {
            console.error("Gagal memuat pengaturan branding:", error);
        }
    }

    function applyBranding() {
        if (!state.developerSettings) return;
        
        const { app_name, logo_url, status_langganan, theme_color, sidebar_color } = state.developerSettings;

        // Branding Sidebar
        const sidebarLogo = document.getElementById('sidebar-logo');
        const sidebarTitle = document.querySelector('#sidebar h1');
        const sidebarSubtitle = document.getElementById('sidebar-subtitle');

        if (logo_url) { sidebarLogo.src = logo_url; sidebarLogo.classList.remove('hidden'); }
        if (app_name) { sidebarTitle.innerText = app_name; sidebarSubtitle.classList.add('hidden'); }

        // Tema Warna Dinamis (White-Labeling)
        if (theme_color || sidebar_color) {
            let styleTag = document.getElementById('tenant-theme-override');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'tenant-theme-override';
                document.head.appendChild(styleTag);
            }
            const primary = theme_color || '#2845D6';
            const sidebar = sidebar_color || '#1e3a8a';
            styleTag.innerHTML = `
                :root {
                    --primary-color: ${primary};
                    --sidebar-bg: ${sidebar};
                }
                .bg-\\[\\#2845D6\\] { background-color: var(--primary-color) !important; }
                .text-\\[\\#2845D6\\] { color: var(--primary-color) !important; }
                .border-\\[\\#2845D6\\] { border-color: var(--primary-color) !important; }
                .focus\\:ring-\\[\\#2845D6\\]:focus { --tw-ring-color: var(--primary-color) !important; }
                .bg-\\[\\#1e3a8a\\] { background-color: var(--sidebar-bg) !important; }
                .border-blue-900 { border-color: rgba(255, 255, 255, 0.1) !important; }
                .bg-blue-900\\/40 { background-color: rgba(255, 255, 255, 0.05) !important; }
                .hover\\:bg-blue-700:hover { background-color: var(--primary-color) !important; filter: brightness(90%) !important; }
                .hover\\:bg-blue-800\\/50:hover { background-color: rgba(255, 255, 255, 0.1) !important; }
                .bg-blue-800\\/50 { background-color: rgba(255, 255, 255, 0.05) !important; }
            `;
        }

        // Cek Status Langganan & Pembayaran (Hanya untuk non-Super Admin)
        if (state.currentRole !== 'Super Admin') {
            const pendingOverlay = document.querySelector('#pending-overlay');
            const inactiveOverlay = document.querySelector('#inactive-overlay');
            const rejectedAlert = document.getElementById('rejected-alert');
            const btnAdd = document.getElementById('btn-add-lead');

            // Sembunyikan semua overlay secara default
            if (pendingOverlay) pendingOverlay.classList.add('hidden');
            if (inactiveOverlay) inactiveOverlay.classList.add('hidden');

            if (status_langganan === 'Pending') {
                if (pendingOverlay && state.currentTab !== 'settings') {
                    pendingOverlay.classList.remove('hidden');
                }
                if (btnAdd) btnAdd.style.display = 'none';
            } 
            else if (status_langganan === 'Inactive' || status_langganan === 'Rejected') {
                if (inactiveOverlay) {
                    inactiveOverlay.classList.remove('hidden');
                    
                    // Set nominal billing pada dialog
                    const billingAmountSpan = document.getElementById('inactive-billing-amount');
                    if (billingAmountSpan && state.developerSettings.billing_amount) {
                        const amountFormatted = parseFloat(state.developerSettings.billing_amount).toLocaleString('id-ID');
                        billingAmountSpan.innerText = amountFormatted;
                    }

                    // Tampilkan detail penolakan jika statusnya Rejected
                    if (status_langganan === 'Rejected') {
                        if (rejectedAlert) {
                            rejectedAlert.classList.remove('hidden');
                            const rejectedReason = document.getElementById('rejected-reason');
                            if (rejectedReason) {
                                rejectedReason.innerText = "Bukti transfer ditolak oleh Admin. Silakan periksa struk Anda dan upload ulang bukti transfer yang valid.";
                            }
                        }
                    } else {
                        if (rejectedAlert) rejectedAlert.classList.add('hidden');
                    }
                }
                if (btnAdd) btnAdd.style.display = 'none';
            }

            // Tambahkan banner peringatan H-3 jika status Active namun billing_due_date dekat
            if (status_langganan === 'Active' && state.developerSettings.billing_due_date) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = new Date(state.developerSettings.billing_due_date);
                dueDate.setHours(0, 0, 0, 0);
                
                const timeDiff = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                const alertContainerId = 'billing-warning-banner';
                let alertBanner = document.getElementById(alertContainerId);
                
                if (diffDays >= 0 && diffDays <= 5) {
                    if (!alertBanner) {
                        alertBanner = document.createElement('div');
                        alertBanner.id = alertContainerId;
                        alertBanner.className = 'bg-orange-50 border-b border-orange-200 text-orange-800 text-[10px] md:text-xs font-bold p-3 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 w-full shrink-0 z-10';
                        const formattedDue = dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                        alertBanner.innerHTML = `
                            <div class="flex items-center justify-center gap-2">
                                <i data-lucide="alert-triangle" class="w-4 h-4 text-orange-600 shrink-0"></i>
                                <span>Layanan Anda berakhir dalam <strong>${diffDays} hari</strong> (Jatuh tempo: <strong>${formattedDue}</strong>). Silakan lakukan transfer perpanjangan segera.</span>
                            </div>
                        `;
                        // Insert alertBanner di bawah header
                        const headerElement = document.querySelector('header');
                        if (headerElement) {
                            headerElement.after(alertBanner);
                        } else {
                            document.getElementById('main-content').prepend(alertBanner);
                        }
                        if (window.lucide) window.lucide.createIcons();
                    }
                } else {
                    if (alertBanner) alertBanner.remove();
                }
            }
        }
    }

    async function markFirstLoginAsComplete() {
        try {
            await ApiService.post('update_first_login_status.php', { user_id: state.currentUser.id });
            
            // Update localStorage agar tidak redirect lagi saat refresh
            const updatedUser = { ...state.currentUser, is_first_login: false };
            state.currentUser = updatedUser;
            localStorage.setItem('mgo_user', JSON.stringify(updatedUser));
            console.log("Status login pertama telah diperbarui.");

        } catch (error) {
            console.error("Gagal memperbarui status login pertama:", error);
        }
    }

    async function refreshData() {
        try {
            // Kirim user_id yang sedang login ke API
            state.leads = await ApiService.getLeads(state.currentUser.id, state.currentRole);
        } catch (error) {
            console.error("Gagal memuat data:", error);
            ui.showToast("Gagal memuat data leads", "error");
        }
    }

    function setupEventListeners() {
        document.getElementById('btn-open-sidebar').addEventListener('click', () => ui.toggleSidebar(true));
        document.getElementById('btn-close-sidebar').addEventListener('click', () => ui.toggleSidebar(false));
        document.getElementById('mobile-overlay').addEventListener('click', () => ui.toggleSidebar(false)); 
        // Pasang event logout ke kedua tombol (header dan sidebar)
        document.getElementById('btn-logout').addEventListener('click', logout);
        const sidebarLogoutBtn = document.getElementById('btn-logout-sidebar');
        if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', logout);
        
        // Log out dari overlay pending & inactive
        const pendingLogoutBtn = document.getElementById('btn-logout-pending');
        if (pendingLogoutBtn) pendingLogoutBtn.addEventListener('click', logout);
        const inactiveLogoutBtn = document.getElementById('btn-logout-inactive');
        if (inactiveLogoutBtn) inactiveLogoutBtn.addEventListener('click', logout);

        // Submit handler untuk konfirmasi pembayaran di halaman blokir
        const inactiveForm = document.getElementById('inactivePaymentForm');
        if (inactiveForm) {
            inactiveForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btnSubmit = e.target.querySelector('button[type="submit"]');
                const originalText = btnSubmit.innerText;
                
                try {
                    btnSubmit.innerText = "Mengirim...";
                    btnSubmit.disabled = true;

                    const formData = new FormData(e.target);
                    formData.append('developer_id', state.currentUser.developer_id);

                    const response = await fetch('api/create_payment_confirmation.php', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const resJson = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(resJson.message || 'Gagal mengirim konfirmasi.');
                    }
                    
                    alert("Sukses! Konfirmasi pembayaran Anda berhasil dikirim dan akan segera diproses oleh Super Admin.");
                    location.reload();

                } catch (error) {
                    console.error(error);
                    alert("Gagal: " + error.message);
                } finally {
                    btnSubmit.innerText = originalText;
                    btnSubmit.disabled = false;
                }
            });
        }

        document.getElementById('btn-add-lead').addEventListener('click', () => {
            injectAddLeadModal();
            ui.openModal('addLeadModal');
        });
        const btnGuide = document.getElementById('btn-menu-guide');
        if (btnGuide) {
            btnGuide.addEventListener('click', () => {
                injectMenuGuideModal(state.currentTab);
            });
        }
        document.addEventListener('lead-selected', (e) => {
            ui.openDrawer(e.detail, state.currentRole);
        });
        // Listener baru: Saat lead dihapus, refresh data
        document.addEventListener('lead-deleted', async () => {
            await refreshData();
            switchTab(state.currentTab); // Re-render tab aktif
        });
        // Listener baru: Saat lead diedit, refresh data
        document.addEventListener('lead-updated', async () => {
            await refreshData();
            switchTab(state.currentTab);
        });
    }

    function setupUserUI() {
        document.getElementById('role-display').innerText = state.currentUser.role || 'N/A';
        document.getElementById('role-initial').innerText = state.currentUser.nama_user ? state.currentUser.nama_user.charAt(0) : '?';
        document.getElementById('header-role-text').innerText = state.currentUser.nama_user || 'User';
    }

    function logout() {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('mgo_user');
            localStorage.removeItem('mgo_super_admin_session');
            window.location.href = 'login.html';
        }
    }

    function injectAddLeadModal() {
        if(document.getElementById('addLeadModal')) return;

        const modalHTML = `
            <div id="addLeadModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md hidden p-4">
                <div class="bg-white w-full max-w-3xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in">
                    <div class="bg-[#1e3a8a] p-5 md:p-8 text-white flex justify-between items-center shrink-0">
                        <div>
                            <h3 class="text-base md:text-xl font-black uppercase tracking-tighter leading-none">Registrasi Prospek Baru</h3>
                            <p class="text-[8px] md:text-[10px] text-blue-200 font-bold uppercase mt-2 italic tracking-widest leading-none">Native API Connection Ready</p>
                        </div>
                        <button type="button" id="btn-close-modal" class="p-2 md:p-3 hover:bg-white/10 rounded-xl transition-all"><i data-lucide="x" class="w-4 h-4 md:w-5 md:h-5"></i></button>
                    </div>
                    <form id="addLeadForm" class="p-5 md:p-8 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Nama Lengkap</label><input required name="name" type="text" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" /></div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">NIK (16 Digit)</label><input required name="nik" type="text" maxlength="16" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" /></div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">WhatsApp (Opsional)</label><input name="phone" type="tel" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" /></div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Pekerjaan</label><input name="job" type="text" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" /></div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Media Masuk</label>
                                <select name="channel" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]">
                                    <option value="FB Ads">FB Ads</option><option value="Instagram">Instagram</option><option value="TikTok">TikTok</option><option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Segmen Prospek</label>
                                <select name="segment" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]">
                                    <option value="Karyawan Mapan">Karyawan Mapan</option><option value="Investor Produktif">Investor Produktif</option><option value="Orang Tua Mahasiswa">Orang Tua Mahasiswa</option><option value="Fresh Married">Fresh Married</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex space-x-3 pt-4 shrink-0">
                            <button type="button" id="btn-cancel-modal" class="flex-1 py-3 md:py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Batal</button>
                            <button type="submit" class="flex-2 w-full py-3 md:py-4 bg-[#2845D6] hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase shadow-xl transition-all tracking-widest">Daftarkan Lead</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('modal-container').innerHTML = modalHTML;
        
        document.getElementById('btn-close-modal').addEventListener('click', () => ui.closeModal('addLeadModal'));
        document.getElementById('btn-cancel-modal').addEventListener('click', () => ui.closeModal('addLeadModal'));
        
        document.getElementById('addLeadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = e.target.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerText;
            
            try {
                btnSubmit.innerText = "Menyimpan...";
                btnSubmit.disabled = true;

                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());

                await ApiService.createLead(data, state.currentUser.id);
                
                ui.showToast("Lead berhasil didaftarkan!");
                ui.closeModal('addLeadModal');
                e.target.reset();

                await refreshData();
                if (state.currentTab === 'pipeline' && pipelineComponent) {
                    pipelineComponent.render();
                }

            } catch (error) {
                console.error(error);
                ui.showToast("Gagal menyimpan lead: " + error.message, "error");
            } finally {
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
            }
        });
        
        if(window.lucide) window.lucide.createIcons();
    }

    function switchTab(tabId) {
        state.currentTab = tabId;
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';

        // Update judul header
        const activeMenu = state.menus.find(m => m.menu_id === tabId);
        document.getElementById('header-title-text').innerText = activeMenu ? activeMenu.label : tabId.replace('-', ' ');

        // Render ulang sidebar untuk menyorot menu aktif
        renderSidebar();

        if (tabId === 'pipeline') {
            mainContent.innerHTML = `<section id="tab-pipeline" class="h-full flex flex-col animate-in"></section>`;
            pipelineComponent = new PipelineComponent('tab-pipeline', state);
            pipelineComponent.render();
        } else if (tabId === 'buyer-list') {
            mainContent.innerHTML = `<section id="tab-buyer-list" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            buyerListComponent = new BuyerListComponent('tab-buyer-list', state);
            buyerListComponent.render();
        } else if (tabId === 'portfolio') {
            mainContent.innerHTML = `<section id="tab-portfolio" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            portfolioComponent = new PortfolioComponent('tab-portfolio', state);
            portfolioComponent.render();
        } else if (tabId === 'client-management') {
            mainContent.innerHTML = `<section id="tab-client-management" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            clientManagementComponent = new ClientManagementComponent('tab-client-management');
            clientManagementComponent.render();
        } else if (tabId === 'reporting') {
            mainContent.innerHTML = `<section id="tab-reporting" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            reportingComponent = new ReportingComponent('tab-reporting', state);
            reportingComponent.render();
        } else if (tabId === 'ai-lead') {
            mainContent.innerHTML = `<section id="tab-ai-lead" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            leadAnalyzerComponent = new LeadAnalyzerComponent('tab-ai-lead', state);
            leadAnalyzerComponent.render();
        } else if (tabId === 'ai-creative') {
            mainContent.innerHTML = `<section id="tab-ai-creative" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            creativeSuiteComponent = new CreativeSuiteComponent('tab-ai-creative', state);
            creativeSuiteComponent.render();
        } else if (tabId === 'ai-objection') {
            mainContent.innerHTML = `<section id="tab-ai-objection" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            objectionGenComponent = new ObjectionGenComponent('tab-ai-objection');
            objectionGenComponent.render();
        } else if (tabId === 'persona') {
            mainContent.innerHTML = `<section id="tab-persona" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            personaInsightComponent = new PersonaInsightComponent('tab-persona', state);
            personaInsightComponent.render();
        } else if (tabId === 'ai-content-calendar') {
            mainContent.innerHTML = `<section id="tab-ai-content-calendar" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            contentCalendarGeneratorComponent = new ContentCalendarGeneratorComponent('tab-ai-content-calendar', state);
            contentCalendarGeneratorComponent.render();
        } else if (tabId === 'ai-engine') {
            mainContent.innerHTML = `<section id="tab-ai-engine" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            aiEngineConfigComponent = new AiEngineConfigComponent('tab-ai-engine');
            aiEngineConfigComponent.render();
        } else if (tabId === 'tasks') {
            mainContent.innerHTML = `<section id="tab-tasks" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            tasksComponent = new TasksComponent('tab-tasks', state);
            tasksComponent.render();
        } else if (tabId === 'calendar') {
            mainContent.innerHTML = `<section id="tab-calendar" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            calendarComponent = new CalendarComponent('tab-calendar', state);
            calendarComponent.render();
        } else if (tabId === 'validation') {
            mainContent.innerHTML = `<section id="tab-validation" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            validationComponent = new ValidationComponent('tab-validation');
            validationComponent.render();
        } else if (tabId === 'settings') {
            mainContent.innerHTML = `<section id="tab-settings" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            settingsComponent = new SettingsComponent('tab-settings', state);
            settingsComponent.render();
        } else if (tabId === 'team-management') {
            mainContent.innerHTML = `<section id="tab-team-management" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            teamManagementComponent = new TeamManagementComponent('tab-team-management', state);
            teamManagementComponent.render();
        } else if (tabId === 'menu-management') {
            mainContent.innerHTML = `<section id="tab-menu-management" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            menuManagementComponent = new MenuManagementComponent('tab-menu-management', state);
            menuManagementComponent.render();
        } else if (tabId === 'impersonation') {
            mainContent.innerHTML = `<section id="tab-impersonation" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            impersonationComponent = new ImpersonationComponent('tab-impersonation', state);
            impersonationComponent.render();
        } else if (tabId === 'token-pool') {
            mainContent.innerHTML = `<section id="tab-token-pool" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            tokenPoolComponent = new TokenPoolComponent('tab-token-pool');
            tokenPoolComponent.render();
        } else if (tabId === 'business-consulting') {
            mainContent.innerHTML = `<section id="tab-business-consulting" class="h-full overflow-y-auto custom-scrollbar pb-10 animate-in"></section>`;
            businessConsultingComponent = new BusinessConsultingComponent('tab-business-consulting', state);
        } else {
            mainContent.innerHTML = `<div class="p-10 text-center text-slate-400">Modul ${tabId} belum dimigrasi.</div>`;
        }
        
        if (window.innerWidth < 768) ui.toggleSidebar(false);
    }

    function renderSidebar() {
        const sidebarMenu = document.getElementById('sidebar-menu');
        sidebarMenu.innerHTML = '';

        // Tentukan urutan kategori
        const categoryOrder = [
            'OPERASIONAL HARIAN',
            'STRATEGI & KONTEN',
            'DEVELOPER',
            'SUPER ADMIN'
        ];

        // Kelompokkan menu berdasarkan kategori
        const groupedMenus = state.menus.reduce((acc, menu) => {
            const category = menu.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(menu);
            return acc;
        }, {});

        // Tambahkan kategori lain secara dinamis jika ada di database tetapi belum ada di categoryOrder
        const allCategories = [...categoryOrder];
        Object.keys(groupedMenus).forEach(category => {
            if (!allCategories.includes(category)) {
                allCategories.push(category);
            }
        });

        allCategories.forEach(category => {
            const menusInCategory = groupedMenus[category];
            if (!menusInCategory) return;

            // Filter menu berdasarkan hak akses role
            const accessibleMenus = menusInCategory.filter(menu => {
                const hasRole = menu.roles.includes('All') || menu.roles.includes(state.currentRole);
                const isPending = state.currentUser.role !== 'Super Admin' && 
                                  state.developerSettings && 
                                  state.developerSettings.status_langganan === 'Pending';
                if (isPending) {
                    // Jika pending, hanya perbolehkan akses ke settings
                    return hasRole && menu.menu_id === 'settings';
                }
                return hasRole;
            });

            if (accessibleMenus.length === 0) return;

            const catHeader = document.createElement('p');
            catHeader.className = "text-[9px] text-blue-300 font-black uppercase tracking-widest mb-2 mt-5 md:mt-6 pl-2";
            // Jika kategori adalah Uncategorized, tampilkan sebagai LAIN-LAIN
            catHeader.innerText = category === 'Uncategorized' ? 'LAIN-LAIN' : category;
            sidebarMenu.appendChild(catHeader);

            accessibleMenus.forEach(menu => {
                const isActive = menu.menu_id === state.currentTab;
                const btn = document.createElement('button');
                btn.id = `menu-${menu.menu_id}`; // Tambahkan ID agar mudah diseleksi
                btn.className = `w-full flex items-center px-4 py-3 rounded-xl transition-all mb-1 ${
                    isActive ? 'bg-[#2845D6] text-white shadow-lg' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                }`;
                btn.innerHTML = `
                    <i data-lucide="${menu.icon || 'circle'}" class="w-[16px] h-[16px] md:w-[18px] md:h-[18px] mr-3"></i>
                    <span class="font-bold text-[10px] uppercase tracking-wider">${menu.label}</span>
                `;
                
                btn.addEventListener('click', () => {
                    window.location.hash = menu.menu_id;
                });
                sidebarMenu.appendChild(btn);
            });
        });

        if (window.lucide) window.lucide.createIcons();
    }

    function assignCategoriesToMenus(menus) {
        const categoryMap = {
            // OPERASIONAL HARIAN
            'pipeline': 'OPERASIONAL HARIAN',
            'ai-lead': 'OPERASIONAL HARIAN',
            'ai-objection': 'OPERASIONAL HARIAN',
            'tasks': 'OPERASIONAL HARIAN',
            'calendar': 'OPERASIONAL HARIAN',
            'reporting': 'OPERASIONAL HARIAN',

            // STRATEGI & KONTEN
            'persona': 'STRATEGI & KONTEN',
            'ai-content-calendar': 'STRATEGI & KONTEN',
            'ai-creative': 'STRATEGI & KONTEN',

            // DEVELOPER
            'team-management': 'DEVELOPER',
            'settings': 'DEVELOPER',
            'buyer-list': 'DEVELOPER',

            // SUPER ADMIN
            'portfolio': 'SUPER ADMIN',
            'impersonation': 'SUPER ADMIN',
            'token-pool': 'SUPER ADMIN',
            'menu-management': 'SUPER ADMIN',
            'client-management': 'SUPER ADMIN',
            'ai-engine': 'SUPER ADMIN',
            'validation': 'SUPER ADMIN',
            'business-consulting': 'SUPER ADMIN',
        };
        return menus.map(menu => {
            menu.category = categoryMap[menu.menu_id] || 'Uncategorized';
            return menu;
        });
    }

    // Fungsi untuk menyediakan menu default jika API gagal
    function getDefaultMenus(role) {
        const allMenus = [
            // OPERASIONAL HARIAN
            { menu_id: 'pipeline', label: 'Lead & Pipeline', icon: 'trending-up', roles: ['All'] },
            { menu_id: 'ai-lead', label: 'Lead Analyzer', icon: 'brain-circuit', roles: ['Developer', 'Admin CS', 'Super Admin'] },
            { menu_id: 'ai-objection', label: 'Objection Gen', icon: 'shield-alert', roles: ['Developer', 'Admin CS', 'Super Admin'] },
            { menu_id: 'tasks', label: 'Task Manager', icon: 'check-square', roles: ['All'] },
            { menu_id: 'calendar', label: 'Calendar', icon: 'calendar-days', roles: ['All'] },
            { menu_id: 'reporting', label: 'Weekly Report', icon: 'bar-chart-2', roles: ['Developer', 'Admin CS', 'Super Admin'] },

            // STRATEGI & KONTEN
            { menu_id: 'persona', label: 'Buyer Persona', icon: 'user-check', roles: ['Developer', 'Admin CS', 'Super Admin'] },
            { menu_id: 'ai-content-calendar', label: 'AI Content Calendar', icon: 'calendar-plus', roles: ['Developer', 'Admin CS', 'Super Admin'] },
            { menu_id: 'ai-creative', label: 'Creative Suite', icon: 'sparkles', roles: ['All'] },

            // DEVELOPER
            { menu_id: 'team-management', label: 'Team Management', icon: 'user-plus', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'settings', label: 'Setting', icon: 'settings', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'buyer-list', label: 'Daftar Buyer', icon: 'users', roles: ['Developer', 'Super Admin'] },

            // SUPER ADMIN
            { menu_id: 'validation', label: 'Validasi Pendaftar', icon: 'check-circle', roles: ['Super Admin'] },
            { menu_id: 'token-pool', label: 'Gudang Token', icon: 'key', roles: ['Super Admin'] },
            { menu_id: 'client-management', label: 'Client Management', icon: 'building-2', roles: ['Super Admin'] },
            { menu_id: 'impersonation', label: 'Login As', icon: 'user-cog', roles: ['Super Admin'] },
            { menu_id: 'menu-management', label: 'Menu Management', icon: 'list', roles: ['Super Admin'] },
            { menu_id: 'portfolio', label: 'Global Portofolio', icon: 'briefcase', roles: ['Super Admin', 'Developer'] },
            { menu_id: 'ai-engine', label: 'AI Engine Config', icon: 'database', roles: ['Super Admin'] },
            { menu_id: 'business-consulting', label: 'AI Business Consulting', icon: 'line-chart', roles: ['Super Admin'] }
        ];
        return allMenus.filter(menu => menu.roles.includes('All') || menu.roles.includes(role));
    }

    const menuGuides = {
        'pipeline': {
            title: 'Lead & Pipeline',
            desc: 'Menu ini diperuntukkan untuk memasukkan data lead yang didapat baik via WhatsApp, DM media sosial, maupun kontak secara langsung. Silakan klik tombol <strong>+ ADD LEAD</strong> berwarna biru di pojok kanan atas. Anda akan disuguhi kotak dialog berupa formulir data lead. Isi data calon konsumen mulai dari Nama, NIK 16 digit, WhatsApp, Pekerjaan, Media Masuk, hingga Segmen Prospek sesuai kolom yang ada, kemudian tekan tombol <strong>Daftarkan Lead</strong>. Setelah data berhasil didaftarkan, data lead Anda akan ditampilkan di daftar kolom pipeline. Anda dapat melakukan <em>drag-and-drop</em> atau menggeser kartu prospek tersebut ke kolom status yang sesuai (seperti <em>New Lead, Contacted, Survei,</em> hingga <em>Closing</em>) agar mempermudah Anda dalam mengetahui posisi terakhir negosiasi lead tersebut.'
        },
        'ai-lead': {
            title: 'Lead Analyzer (AI)',
            desc: 'Menu ini diperuntukkan untuk menganalisis isi obrolan dengan calon konsumen guna mengetahui psikologi, minat, dan tingkat ketertarikan mereka. Salin atau <em>copy-paste</em> seluruh teks percakapan terakhir Anda dengan calon pembeli dari WhatsApp ke dalam kolom input yang disediakan. Setelah itu, pilih model AI yang ingin digunakan lalu klik tombol <strong>Mulai Analisis</strong>. AI akan memproses teks tersebut dan menampilkan hasil analisis mendalam. Anda dapat melihat apakah prospek Anda berstatus <em>Cold, Warm,</em> atau <em>Hot</em>, disertai dengan analisis psikologis, rekomendasi produk properti yang cocok, serta draf teks balasan yang persuasif untuk dikirim kembali ke calon konsumen agar mempermudah proses closing.'
        },
        'ai-objection': {
            title: 'Objection Generator (AI)',
            desc: 'Menu ini diperuntukkan untuk membantu tim sales atau CS dalam merancang jawaban terbaik ketika calon konsumen menyampaikan keberatan tertentu dalam proses negosiasi. Ketikkan secara detail apa yang menjadi alasan atau keberatan dari calon konsumen (misalnya: <em>"Harga unit properti kemahalan"</em> atau <em>"Lokasinya terlalu jauh"</em>). Setelah mengisi kolom keberatan tersebut, klik tombol <strong>Hasilkan Jawaban</strong>. AI akan segera merancang 3 alternatif kalimat jawaban syariah yang santun, solutif, dan tetap persuasif. Anda cukup memilih salah satu jawaban yang paling pas, klik salin, lalu kirimkan pesan tersebut langsung ke WhatsApp calon konsumen Anda.'
        },
        'tasks': {
            title: 'Task Manager',
            desc: 'Menu ini diperuntukkan untuk mencatat dan mengatur jadwal kerja atau tugas-tugas harian Anda agar tidak ada tindak lanjut (follow-up) konsumen yang terlewat. Klik tombol tambah tugas baru. Isi formulir tugas mulai dari Judul Tugas (misalnya: <em>"Kirim brosur tipe 45"</em>), berikan deskripsi tambahan jika diperlukan, tentukan tanggal serta jam tenggat waktunya, lalu hubungkan tugas tersebut ke salah satu nama lead Anda. Klik simpan untuk memasukkan tugas ke daftar tugas. Jika Anda telah selesai mengerjakan tugas tersebut, cukup klik ikon centang pada tugas yang bersangkutan untuk menandai tugas tersebut telah selesai.'
        },
        'calendar': {
            title: 'Calendar',
            desc: 'Menu ini diperuntukkan untuk memantau semua agenda, janji temu, dan jadwal survei lokasi perumahan secara visual dalam bentuk kalender terpadu. Di sini Anda akan melihat visualisasi kalender bulanan lengkap dengan kotak-kotak jadwal yang berwarna-warni. Setiap kotak mewakili tugas aktif atau jadwal survei yang telah Anda buat di Task Manager. Anda cukup mengklik pada salah satu tanggal untuk melihat rincian detail tugas apa saja yang harus diselesaikan pada hari itu, sehingga perencanaan jadwal kerja harian Anda menjadi lebih efisien dan terarah.'
        },
        'reporting': {
            title: 'Weekly Report',
            desc: 'Menu ini diperuntukkan untuk melihat ringkasan statistik perkembangan prospek dan kinerja penjualan tim secara berkala. Di halaman ini, Anda akan disuguhi diagram dan grafik interaktif yang menampilkan jumlah prospek masuk, tingkat konversi dari <em>Lead</em> ke <em>Closing</em>, serta statistik media promosi mana saja yang menyumbang pembeli terbanyak. Data ini sangat berguna bagi tim CS untuk menyusun laporan mingguan dan membantu Developer dalam mengevaluasi efektivitas iklan perumahan Anda.'
        },
        'persona': {
            title: 'Buyer Persona (AI)',
            desc: 'Menu ini diperuntukkan untuk menganalisis profil psikologis calon konsumen agar Anda dapat menerapkan pendekatan penjualan yang tepat sasaran. Pilih salah satu segmen calon pembeli yang ingin Anda analisis (misalnya: <em>Karyawan Mapan</em> atau <em>Pasangan Baru Menikah</em>), kemudian tekan tombol analisis. AI akan memaparkan profil psikologis mereka secara lengkap, mulai dari apa ketakutan terbesar mereka, keinginan terdalam tentang kepemilikan rumah, hingga kata-kata kunci promosi yang paling menarik minat mereka untuk membeli unit properti Anda.'
        },
        'ai-content-calendar': {
            title: 'AI Content Calendar',
            desc: 'Menu ini diperuntukkan untuk menyusun jadwal ide postingan dan copywriting promosi di media sosial secara otomatis selama 30 hari penuh. Pada kolom formulir, masukkan nama perumahan Anda beserta target pasarnya, lalu klik tombol susun kalender. Sistem AI akan otomatis menghasilkan tabel jadwal konten bulanan lengkap untuk Anda. Anda akan mendapatkan ide visual foto atau video, draf caption promosi WhatsApp/Instagram, serta tagar yang relevan untuk setiap harinya selama sebulan penuh.'
        },
        'ai-creative': {
            title: 'Creative Suite (AI)',
            desc: 'Menu ini diperuntukkan untuk membuat materi iklan promosi properti secara instan, mulai dari draf tulisan promosi (<em>copywriting</em>) hingga ide skrip video pendek. Di sini terdapat beberapa tab pilihan seperti <em>Caption</em> dan <em>Video Script</em>. Tuliskan informasi singkat atau keunggulan dari unit perumahan Anda, lalu tekan tombol proses. AI akan langsung membuatkan naskah copywriting promosi yang persuasif lengkap dengan emoji-emoji menarik yang siap Anda gunakan untuk iklan media sosial atau broadcast WhatsApp.'
        },
        'team-management': {
            title: 'Team Management',
            desc: 'Menu ini diperuntukkan bagi pemilik perumahan atau Developer untuk mengelola akun staf admin CS dan agent freelance yang bekerja di bawah naungannya. Di halaman ini, Anda dapat melihat daftar seluruh anggota tim Anda. Untuk menambahkan anggota baru, klik tombol tambah anggota, isi nama lengkap staf, nomor WhatsApp, serta buatkan username dan password khusus untuk mereka login. Tentukan pula perannya sebagai <em>Admin CS</em> atau <em>Agent Freelance</em>. Staf Anda sekarang dapat menggunakan akun tersebut untuk masuk ke sistem, dan Anda dapat menonaktifkan akses akun mereka kapan saja jika diperlukan.'
        },
        'settings': {
            title: 'Setting',
            desc: 'Menu ini diperuntukkan bagi Developer untuk menyesuaikan identitas aplikasi agar sesuai dengan brand perumahan sendiri serta melakukan integrasi WhatsApp. Di bagian <em>Branding</em>, Anda dapat mengunggah logo perumahan Anda dan menentukan warna tema sidebar aplikasi. Di bagian <em>WhatsApp Integration</em>, Anda dapat memasukkan token Fonnte Anda, menulis instruksi persona Bot AI Anda (misalnya asisten cerdas yang ramah dan siap melayani), kemudian hubungkan nomor WhatsApp operasional Anda dengan memindai kode QR yang muncul. Setelah terhubung, asisten otomatis cerdas AI Anda akan langsung aktif menjawab pertanyaan calon pembeli 24 jam non-stop.'
        },
        'buyer-list': {
            title: 'Daftar Buyer',
            desc: 'Menu ini diperuntukkan untuk melihat database riwayat seluruh calon konsumen yang transaksinya telah dinyatakan sukses atau <em>Closed/Selesai</em> oleh tim penjualan Anda. Di sini, terkumpul daftar lengkap nama konsumen yang telah membeli unit properti di perumahan Anda. Database ini sangat penting untuk arsip internal developer, pengelolaan data sertifikat/legalitas, serta sebagai target pasar utama untuk program loyalitas pelanggan atau penawaran proyek properti baru Anda di masa mendatang.'
        }
    };

    function injectMenuGuideModal(tabId) {
        const guide = menuGuides[tabId] || {
            title: tabId.replace('-', ' ').toUpperCase(),
            desc: 'Panduan untuk menu ini belum tersedia atau sedang dikembangkan.'
        };
        
        let modal = document.getElementById('menuGuideModal');
        if (modal) {
            modal.remove();
        }
        
        const modalHTML = `
            <div id="menuGuideModal" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <div class="bg-white w-full max-w-lg rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
                    <div class="bg-[#2845D6] p-5 md:p-8 text-white flex justify-between items-center shrink-0">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-white/10 rounded-xl">
                                <i data-lucide="help-circle" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-sm md:text-base font-black uppercase tracking-tighter leading-none">Panduan Menu</h3>
                                <p class="text-[10px] text-blue-200 font-bold uppercase mt-1.5 tracking-widest leading-none">${guide.title}</p>
                            </div>
                        </div>
                        <button type="button" id="btn-close-guide-modal" class="p-2 hover:bg-white/10 rounded-xl transition-all"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <div class="p-6 md:p-8 space-y-4 overflow-y-auto custom-scrollbar text-xs md:text-sm font-semibold text-slate-600 leading-relaxed">
                        <p>${guide.desc}</p>
                    </div>
                    <div class="px-6 md:px-8 pb-6 md:pb-8 shrink-0">
                        <button type="button" id="btn-confirm-guide-modal" class="w-full py-3.5 bg-[#2845D6] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95">Saya Mengerti</button>
                    </div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.id = 'guide-modal-container';
        div.innerHTML = modalHTML;
        document.body.appendChild(div);
        
        const closeGuide = () => {
            const m = document.getElementById('menuGuideModal');
            if (m) m.closest('#guide-modal-container').remove();
        };
        
        document.getElementById('btn-close-guide-modal').addEventListener('click', closeGuide);
        document.getElementById('btn-confirm-guide-modal').addEventListener('click', closeGuide);
        
        if (window.lucide) window.lucide.createIcons();
    }
}