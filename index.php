<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CRM Pro Syariah Ultimate - Native Web App</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css?v=<?php echo time(); ?>">
</head>
<body class="bg-slate-50 text-slate-800">

    <div class="flex h-screen overflow-hidden font-sans relative">
        
        <!-- MOBILE OVERLAY -->
        <div id="mobile-overlay" class="fixed inset-0 bg-black/50 z-40 hidden md:hidden transition-opacity backdrop-blur-sm"></div>

        <!-- SIDEBAR -->
        <aside id="sidebar" class="fixed inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 w-[260px] md:w-64 bg-[#1e3a8a] text-white flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out shrink-0">
            <div class="p-6 md:p-8 border-b border-blue-900 text-center flex items-center justify-between md:block">
                <img id="sidebar-logo" src="" alt="Logo" class="w-12 h-12 rounded-full mx-auto mb-3 object-cover bg-blue-900 hidden">
                <div class="w-full">
                    <h1 class="text-xl font-black text-[#F8843F] tracking-tighter italic">CRM PRO SYARIAH</h1>
                    <p id="sidebar-subtitle" class="text-[9px] text-blue-200 mt-1 uppercase font-bold tracking-[0.2em]">PROPERTY SYARIAH</p>
                </div>
                <button id="btn-close-sidebar" class="md:hidden p-2 bg-white/10 rounded-xl hover:bg-white/20">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar" id="sidebar-menu"></nav>

            <div class="p-4 border-t border-blue-900 bg-[#172554]">
                <div class="flex items-center p-3 rounded-2xl bg-blue-900/40 border border-white/5">
                    <div id="role-initial" class="w-8 h-8 shrink-0 rounded-full bg-[#2845D6] flex items-center justify-center mr-3 font-black text-xs border border-white/20 uppercase shadow-inner">S</div>
                    <div class="overflow-hidden">
                        <p class="font-bold text-[10px] truncate leading-none mb-1">Session Active</p>
                        <p id="role-display" class="text-blue-200 text-[8px] uppercase font-black italic truncate">Super Admin</p>
                    </div>
                </div>
                <button id="btn-logout-sidebar" class="w-full mt-2 py-2 bg-red-900/20 text-red-400 border border-red-900/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center group">
                    <i data-lucide="log-out" class="w-3 h-3 mr-2 group-hover:scale-110 transition-transform"></i> Keluar
                </button>
            </div>

            <!-- MGO Branding -->
            <div class="p-4 mt-auto">
                <div class="flex items-center justify-center gap-3">
                    <img src="https://assets.about.me/background/users/d/i/g/digitalmarketingjakarta_1464927354_96.jpg" alt="Muslim Go Online" class="w-8 h-8 rounded-full">
                    <div>
                        <p class="text-sm font-black text-[#F8843F] tracking-tighter italic">Muslim Go Online</p>
                    </div>
                </div>
            </div>
        </aside>

        <!-- MAIN CONTENT AREA -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            
            <header class="bg-white shadow-sm px-4 md:px-8 py-3 md:py-4 flex justify-between items-center z-20 border-b">
                <div class="flex items-center min-w-0 mr-2">
                    <button id="btn-open-sidebar" class="md:hidden mr-3 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0">
                        <i data-lucide="menu" class="w-5 h-5"></i>
                    </button>
                    <h2 id="header-title" class="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest flex items-center truncate">
                        <i data-lucide="zap" class="w-3 h-3 md:w-4 md:h-4 mr-2 text-[#2845D6] shrink-0"></i> 
                        <span id="header-title-text" class="truncate">PIPELINE</span>
                    </h2>
                </div>
                <div class="flex space-x-2 md:space-x-3 shrink-0">
                    <button id="btn-logout" class="bg-red-50 text-red-700 border border-red-100 px-3 md:px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-sm flex items-center transition-all active:scale-95 hover:bg-red-100">
                        <i data-lucide="log-out" class="w-3 h-3 md:mr-2"></i> 
                        <span id="header-role-text" class="hidden sm:inline">Nama User</span>
                    </button>
                    <button id="btn-add-lead" class="bg-[#2845D6] text-white px-3 md:px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 hover:bg-blue-700 transition-all">
                        <span class="md:hidden"><i data-lucide="plus" class="w-3 h-3"></i></span>
                        <span class="hidden md:inline">+ Add Lead</span>
                    </button>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50/50 relative" id="main-content"></main>
        </div>

        <!-- MODAL & DRAWER CONTAINERS -->
        <div id="modal-container"></div>
        <div id="drawer-container"></div>

        <!-- PENDING OVERLAY (Untuk Tenant yang belum bayar/approve) -->
        <div id="pending-overlay" class="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[300] hidden flex items-center justify-center p-6">
            <div class="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-lg text-center animate-in zoom-in-95 duration-500">
                <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600"><i data-lucide="clock" class="w-10 h-10"></i></div>
                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Validasi Pembayaran</h3>
                <p class="text-sm text-slate-500 font-medium mt-4 leading-relaxed">Akun Anda sedang dalam proses verifikasi oleh tim Super Admin. Mohon tunggu maksimal 1x24 jam.</p>
                <div class="flex space-x-3 mt-8">
                    <button id="btn-logout-pending" class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Keluar</button>
                    <button onclick="location.reload()" class="flex-2 w-full py-4 bg-[#2845D6] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Cek Status</button>
                </div>
            </div>
        </div>

        <!-- INACTIVE OVERLAY (Untuk Tenant yang habis masa aktif / terblokir / ditolak) -->
        <div id="inactive-overlay" class="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[290] hidden flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
            <div class="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl max-w-xl w-full text-center my-8 animate-in zoom-in-95 duration-500">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><i data-lucide="shield-alert" class="w-8 h-8"></i></div>
                <h3 class="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Masa Aktif Berakhir</h3>
                <p class="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wider">LAYANAN DINONAKTIFKAN SEMENTARA</p>
                
                <!-- Rejected Alert Box (Dynamically shown) -->
                <div id="rejected-alert" class="hidden bg-red-50 text-red-700 border border-red-200 p-4 rounded-2xl text-left text-xs mt-4">
                    <p class="font-bold">❌ Konfirmasi Pembayaran Ditolak:</p>
                    <p id="rejected-reason" class="mt-1 italic">Bukti transfer tidak terbaca.</p>
                </div>

                <div class="bg-slate-50 p-5 rounded-2xl border text-left mt-6 space-y-2 text-xs">
                    <p class="font-bold text-slate-700">Silakan lakukan pembayaran langganan bulanan sebesar:</p>
                    <p class="text-xl font-black text-[#F8843F] mb-3">Rp <span id="inactive-billing-amount">150.000</span></p>
                    <div class="border-t pt-3 space-y-1 text-[11px] text-slate-600">
                        <p>🏦 Bank Tujuan: **Bank Mandiri / BSI**</p>
                        <p>💳 No Rekening: **123-456-7890**</p>
                        <p>👤 Atas Nama: **MuslimGo Online**</p>
                    </div>
                </div>

                <form id="inactivePaymentForm" class="mt-6 text-left space-y-4">
                    <div class="space-y-1">
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Jumlah Transfer (Rp)</label>
                        <input required type="number" id="inactive-pay-amount" name="amount" class="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" placeholder="Contoh: 150000" />
                    </div>
                    <div class="space-y-1">
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Foto Bukti Transfer (.png / .jpg / .jpeg)</label>
                        <input required type="file" name="payment_proof" accept="image/*" class="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                    </div>
                    <div class="flex space-x-2 pt-2">
                        <button type="button" id="btn-logout-inactive" class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Logout</button>
                        <button type="submit" class="flex-2 w-full py-3 bg-[#2845D6] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Kirim Konfirmasi</button>
                    </div>
                </form>
            </div>
        </div>

    </div>
    <script>
        lucide.createIcons();
    </script>
    <script type="module" src="assets/js/main.js?v=<?php echo time(); ?>"></script>
</body>
</html>
