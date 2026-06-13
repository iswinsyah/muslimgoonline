// App Version: 1.0.1 - Triggering Deployment to crmprosyariah.online
// App Version: 1.0.4 - Force Sync Menu Daftar Buyer
import { ApiService } from './api.js';
import { UI } from './ui.js';
import { PipelineComponent } from './components/pipeline.js';
import { PortfolioComponent } from './components/portfolio.js';
import { ReportingComponent } from './components/reporting.js';
import { ClientManagementComponent } from './components/client_management.js';
import { LeadAnalyzerComponent, CreativeSuiteComponent, ObjectionGenComponent, PersonaInsightComponent, AiEngineConfigComponent, ContentCalendarGeneratorComponent } from './components/ai_features.js';
import { TasksComponent } from './components/tasks.js';
import { CalendarComponent } from './components/calendar.js';
import { ValidationComponent } from './components/validation.js';
import { MenuManagementComponent } from './components/menu_management.js';
import { ImpersonationComponent } from './components/impersonation.js';
import { SettingsComponent } from './components/settings.js';
import { TeamManagementComponent } from './components/team_management.js';
import { BuyerListComponent } from './components/buyer_list.js';

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
                fetchedMenus = await ApiService.get('get_menus.php');
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

        if (hash === 'settings' && state.currentUser.role === 'Developer' && state.currentUser.is_first_login) {
            console.log("Developer login pertama, arahkan ke settings (Menu Management).");
            switchTab('settings'); // Ini akan memuat MenuManagementComponent
            await markFirstLoginAsComplete();
        } else {
            switchTab(hash || 'pipeline'); // Halaman default
        }

        // Dengarkan perubahan hash untuk navigasi tanpa reload halaman
        window.addEventListener('hashchange', () => {
            const newHash = window.location.hash.substring(1);
            switchTab(newHash || 'pipeline');
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
        
        const { app_name, logo_url, status_langganan } = state.developerSettings;

        // Branding Sidebar
        const sidebarLogo = document.getElementById('sidebar-logo');
        const sidebarTitle = document.querySelector('#sidebar h1');
        const sidebarSubtitle = document.getElementById('sidebar-subtitle');

        if (logo_url) { sidebarLogo.src = logo_url; sidebarLogo.classList.remove('hidden'); }
        if (app_name) { sidebarTitle.innerText = app_name; sidebarSubtitle.classList.add('hidden'); }

        // Cek Validasi Pembayaran (Hanya untuk non-Super Admin)
        if (state.currentRole !== 'Super Admin' && status_langganan === 'Pending') {
            const pendingOverlay = document.querySelector('#pending-overlay');
            if (pendingOverlay) {
                pendingOverlay.classList.remove('hidden');
                const btnAdd = document.getElementById('btn-add-lead');
                if (btnAdd) btnAdd.style.display = 'none';
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
        document.getElementById('btn-add-lead').addEventListener('click', () => {
            injectAddLeadModal();
            ui.openModal('addLeadModal');
        });
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
            leadAnalyzerComponent = new LeadAnalyzerComponent('tab-ai-lead');
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
            impersonationComponent = new ImpersonationComponent('tab-impersonation');
            impersonationComponent.render();
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
            'Manajemen Lanjutan',
            'Administrasi Sistem'
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

        categoryOrder.forEach(category => {
            const menusInCategory = groupedMenus[category];
            if (!menusInCategory) return;

            // Filter menu berdasarkan hak akses role
            const accessibleMenus = menusInCategory.filter(menu => 
                menu.roles.includes('All') || menu.roles.includes(state.currentRole)
            );

            if (accessibleMenus.length === 0) return;

            const catHeader = document.createElement('p');
            catHeader.className = "text-[9px] text-blue-300 font-black uppercase tracking-widest mb-2 mt-5 md:mt-6 pl-2";
            catHeader.innerText = category;
            sidebarMenu.appendChild(catHeader);

            accessibleMenus.forEach(menu => {
                const isActive = menu.menu_id === state.currentTab;
                const btn = document.createElement('button');
                btn.id = `menu-${menu.menu_id}`; // Tambahkan ID agar mudah diseleksi
                btn.className = `w-full flex items-center px-4 py-3 rounded-xl transition-all mb-1 ${
                    isActive ? 'bg-[#2845D6] text-white shadow-lg' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                }`;
                btn.innerHTML = `
                    <i data-lucide="${menu.icon}" class="w-[16px] h-[16px] md:w-[18px] md:h-[18px] mr-3"></i>
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
            // Operasional Harian
            'pipeline': 'OPERASIONAL HARIAN',
            'buyer-list': 'OPERASIONAL HARIAN',
            'ai-lead': 'OPERASIONAL HARIAN',
            'ai-objection': 'OPERASIONAL HARIAN',
            'tasks': 'OPERASIONAL HARIAN',
            'calendar': 'OPERASIONAL HARIAN',
            'reporting': 'OPERASIONAL HARIAN',

            // Strategi & Konten
            'persona': 'STRATEGI & KONTEN',
            'ai-content-calendar': 'STRATEGI & KONTEN',
            'ai-creative': 'STRATEGI & KONTEN',

            // Manajemen Lanjutan
            'ai-engine': 'Manajemen Lanjutan',
            'client-management': 'Manajemen Lanjutan',
            'team-management': 'Manajemen Lanjutan',
            'validation': 'Manajemen Lanjutan',
            'portfolio': 'Manajemen Lanjutan',

            // Administrasi Sistem
            'menu-management': 'Administrasi Sistem',
            'impersonation': 'Administrasi Sistem',
            'settings': 'Administrasi Sistem',
        };
        return menus.map(menu => {
            menu.category = categoryMap[menu.menu_id] || 'Uncategorized';
            return menu;
        });
    }

    // Fungsi untuk menyediakan menu default jika API gagal
    function getDefaultMenus(role) {
        const allMenus = [
            { menu_id: 'pipeline', label: 'Lead & Pipeline', icon: 'trending-up', roles: ['All'] },
            { menu_id: 'buyer-list', label: 'Daftar Buyer', icon: 'users', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'ai-lead', label: 'Lead Analyzer', icon: 'brain-circuit', roles: ['Developer', 'Admin CS', 'Super Admin'] },
            { menu_id: 'ai-objection', label: 'Objection Gen', icon: 'shield-alert', roles: ['Developer', 'Admin CS', 'Super Admin'] },
            { menu_id: 'tasks', label: 'Task Manager', icon: 'check-square', roles: ['All'] },
            { menu_id: 'calendar', label: 'Calendar', icon: 'calendar-days', roles: ['All'] },
            { menu_id: 'reporting', label: 'Weekly Report', icon: 'bar-chart-2', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'persona', label: 'AI Persona Insight', icon: 'user-check', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'ai-content-calendar', label: 'AI Content Calendar', icon: 'calendar-plus', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'ai-creative', label: 'Creative Suite', icon: 'sparkles', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'ai-engine', label: 'AI Engine Config', icon: 'database', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'client-management', label: 'Client Management', icon: 'users', roles: ['Super Admin'] },
            { menu_id: 'team-management', label: 'Team Management', icon: 'user-plus', roles: ['Developer', 'Super Admin'] },
            { menu_id: 'validation', label: 'Validation', icon: 'check-circle', roles: ['Super Admin'] },
            { menu_id: 'portfolio', label: 'Portfolio', icon: 'briefcase', roles: ['Super Admin'] },
            { menu_id: 'menu-management', label: 'Menu Management', icon: 'list', roles: ['Super Admin'] },
            { menu_id: 'impersonation', label: 'Impersonation', icon: 'user-cog', roles: ['Super Admin'] },
            { menu_id: 'settings', label: 'Settings', icon: 'settings', roles: ['Developer', 'Super Admin'] },
        ];
        return allMenus.filter(menu => menu.roles.includes('All') || menu.roles.includes(role));
    }
}