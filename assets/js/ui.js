import { maskInfo } from './helpers.js';
import { ApiService } from './api.js';

export class UI {
    constructor() {
        this.els = {
            sidebar: document.getElementById('sidebar'),
            mobileOverlay: document.getElementById('mobile-overlay'),
            modalContainer: document.getElementById('modal-container'),
            drawerContainer: document.getElementById('drawer-container'),
        };
    }

    toggleSidebar(forceState = null) {
        const isOpen = forceState !== null 
            ? forceState 
            : this.els.sidebar.classList.contains('-translate-x-full');

        if (isOpen) {
            this.els.sidebar.classList.remove('-translate-x-full');
            this.els.mobileOverlay.classList.remove('hidden');
        } else {
            this.els.sidebar.classList.add('-translate-x-full');
            this.els.mobileOverlay.classList.add('hidden');
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    showToast(message, type = 'success') {
        alert(`[${type.toUpperCase()}] ${message}`);
    }

    renderLoading(message = 'Memuat...') {
        return `
            <div class="p-10 text-center text-slate-500 animate-pulse">
                <i data-lucide="loader-2" class="w-8 h-8 mx-auto animate-spin"></i>
                <p class="mt-4 text-sm font-bold">${message}</p>
            </div>
        `;
    }

    renderError(message = 'Terjadi kesalahan.') {
        return `
            <div class="p-10 text-center text-red-500 bg-red-50 rounded-2xl border border-red-200">
                <i data-lucide="alert-triangle" class="w-8 h-8 mx-auto"></i>
                <p class="mt-4 text-sm font-bold">${message}</p>
            </div>
        `;
    }

    openDrawer(lead, currentRole) {
        // --- Authorization Logic (Synchronized with API) ---
        const user = JSON.parse(localStorage.getItem('mgo_user')) || {};

        // 1. Cek apakah API sudah menandai ini sebagai 'Self' (Paling Akurat)
        const isMarkedSelf = lead.owner === 'Self';
        
        // 2. Cek manual ID sebagai backup (Loose equality untuk menangani string vs number)
        const isIdMatch = (lead.owner_id == user.id);

        // 3. Gabungkan logika
        const isOwner = isMarkedSelf || isIdMatch;
        const isAdmin = (currentRole === 'Developer' || currentRole === 'Super Admin');
        const canManage = isAdmin || isOwner;
        
        const drawerHTML = `
        <div id="leadDetailModal" class="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
            <div class="w-[85%] sm:w-[480px] bg-white h-full shadow-2xl overflow-y-auto p-6 md:p-10 border-l relative flex flex-col animate-in slide-in-from-right-8">
                <div class="flex justify-between items-center mb-6 md:mb-8 shrink-0">
                    <button id="btn-close-drawer" class="p-2 hover:bg-slate-100 rounded-full bg-slate-50"><i data-lucide="x" class="w-5 h-5"></i></button>
                    ${canManage ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 text-[9px] font-bold rounded uppercase">Admin/Owner Access</span>' : ''}
                </div>
                <div class="space-y-6 md:space-y-8 flex-1">
                    <div>
                        <h3 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter leading-none uppercase">${lead.name}</h3>
                        <p class="text-[9px] md:text-[10px] font-bold text-teal-600 uppercase tracking-widest italic tracking-tighter mt-2">${lead.segment || 'Umum'}</p>
                        <div class="mt-4 md:mt-6 space-y-2 md:space-y-3">
                            <div class="flex items-center p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 shadow-inner">
                                <i data-lucide="fingerprint" class="w-4 h-4 text-teal-600 mr-3 shrink-0"></i>
                                <span class="text-xs md:text-sm font-black text-slate-600 tracking-widest break-all">${maskInfo(lead.nik, lead.owner, currentRole, 'nik')}</span>
                            </div>
                            <div class="flex items-center p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 shadow-inner">
                                <i data-lucide="phone" class="w-4 h-4 text-teal-600 mr-3 shrink-0"></i>
                                <span class="text-xs md:text-sm font-black text-slate-600 tracking-widest break-all">${maskInfo(lead.phone, lead.owner, currentRole, 'phone')}</span>
                            </div>
                            <div class="grid grid-cols-2 gap-3 md:gap-4 mt-4">
                                <div class="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 shadow-inner"><p class="text-[8px] font-black text-slate-400 uppercase mb-1 leading-none">Pekerjaan</p><p class="text-[10px] md:text-xs font-black text-slate-800 truncate">${lead.job || "-"}</p></div>
                                <div class="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 shadow-inner"><p class="text-[8px] font-black text-slate-400 uppercase mb-1 leading-none">Status</p><p class="text-[10px] md:text-xs font-black text-slate-800 truncate">${lead.status.replace('_', ' ')}</p></div>
                            </div>
                        </div>
                    </div>
                    ${canManage ? `
                        <div class="space-y-3 md:space-y-4 mt-6 md:mt-8 border-t pt-6">
                            <div class="p-4 md:p-6 bg-teal-50 rounded-[1.5rem] md:rounded-[2.5rem] border border-teal-100 italic">
                                <p class="text-[9px] md:text-[10px] font-black text-teal-600 uppercase mb-1 flex items-center"><i data-lucide="shield-check" class="w-3.5 h-3.5 mr-2"></i> Data Verified</p>
                                <p class="text-[10px] md:text-[11px] font-medium text-teal-800 leading-relaxed">Anda memiliki akses penuh untuk mengelola data ini.</p>
                            </div>
                            ${lead.phone ? `<a href="https://wa.me/${lead.phone.replace(/^0/, '62')}" target="_blank" class="w-full py-4 md:py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all flex justify-center items-center"><i data-lucide="message-circle" class="w-4 h-4 mr-2"></i> Chat WhatsApp Sekarang</a>` : `<div class="w-full py-4 md:py-5 bg-slate-100 text-slate-400 rounded-xl md:rounded-2xl font-black text-[10px] uppercase flex justify-center items-center cursor-not-allowed"><i data-lucide="message-circle-off" class="w-4 h-4 mr-2"></i> No WhatsApp Available</div>`}
                            
                            <div class="grid grid-cols-2 gap-3 mt-4">
                                <button id="btn-edit-lead" class="py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-black text-[10px] uppercase transition-all flex justify-center items-center border border-blue-100">
                                    <i data-lucide="edit" class="w-4 h-4 mr-2"></i> Edit Data
                                </button>
                                <button id="btn-delete-lead" data-id="${lead.id}" class="py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-black text-[10px] uppercase transition-all flex justify-center items-center border border-red-100">
                                    <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> Hapus
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="p-6 md:p-8 bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-2xl space-y-4 border border-white/5 mt-6 md:mt-8">
                            <i data-lucide="shield-question" class="w-6 h-6 md:w-8 md:h-8 text-orange-500"></i>
                            <h4 class="text-xs md:text-sm font-black uppercase tracking-widest leading-none">Protected Data</h4>
                            <p class="text-[10px] md:text-xs text-slate-400 italic leading-relaxed">Data ini dimiliki oleh rekan tim lain. Detail disensor untuk menjaga privasi.</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
        `;

        this.els.drawerContainer.innerHTML = drawerHTML;
        
        document.getElementById('btn-close-drawer').addEventListener('click', () => {
            this.els.drawerContainer.innerHTML = '';
        });

        const btnEdit = document.getElementById('btn-edit-lead');
        if (btnEdit) {
            btnEdit.addEventListener('click', () => this.openEditLeadModal(lead));
        }

        const btnDelete = document.getElementById('btn-delete-lead');
        if (btnDelete) {
            btnDelete.addEventListener('click', async () => {
                if (confirm('PERINGATAN: Data lead ini akan dihapus permanen. Lanjutkan?')) {
                    try {
                        // Kita butuh user ID, ambil dari localStorage karena UI tidak punya state
                        const user = JSON.parse(localStorage.getItem('mgo_user'));
                        await ApiService.deleteLead(lead.id, user.id);
                        
                        this.showToast('Lead berhasil dihapus.');
                        this.els.drawerContainer.innerHTML = ''; // Tutup drawer
                        document.dispatchEvent(new CustomEvent('lead-deleted')); // Kabari main.js untuk refresh
                    } catch (error) {
                        this.showToast('Gagal menghapus: ' + error.message, 'error');
                    }
                }
            });
        }

        if(window.lucide) window.lucide.createIcons();
    }

    openEditLeadModal(lead) {
        const modalHTML = `
            <div id="editLeadModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <div class="bg-white w-full max-w-3xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in">
                    <div class="bg-[#1e3a8a] p-5 md:p-8 text-white flex justify-between items-center shrink-0">
                        <div>
                            <h3 class="text-base md:text-xl font-black uppercase tracking-tighter leading-none">Edit Data Prospek</h3>
                        </div>
                        <button type="button" id="btn-close-edit-modal" class="p-2 md:p-3 hover:bg-white/10 rounded-xl transition-all"><i data-lucide="x" class="w-4 h-4 md:w-5 md:h-5"></i></button>
                    </div>
                    <form id="editLeadForm" class="p-5 md:p-8 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
                        <input type="hidden" name="id" value="${lead.id}">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Nama Lengkap</label><input required name="name" type="text" value="${lead.name}" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" /></div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">NIK (16 Digit)</label><input required name="nik" type="text" maxlength="16" value="${lead.nik || ''}" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" /></div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">WhatsApp (Opsional)</label><input name="phone" type="tel" value="${lead.phone || ''}" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" /></div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Pekerjaan</label><input name="job" type="text" value="${lead.job || ''}" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" /></div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Media Masuk</label>
                                <select name="channel" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]">
                                    <option value="FB Ads" ${lead.channel === 'FB Ads' ? 'selected' : ''}>FB Ads</option>
                                    <option value="Instagram" ${lead.channel === 'Instagram' ? 'selected' : ''}>Instagram</option>
                                    <option value="TikTok" ${lead.channel === 'TikTok' ? 'selected' : ''}>TikTok</option>
                                    <option value="Lainnya" ${lead.channel === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
                                </select>
                            </div>
                            <div class="space-y-1 md:space-y-2"><label class="text-[9px] font-black text-slate-400 uppercase pl-1 tracking-widest">Segmen Prospek</label>
                                <select name="segment" class="w-full bg-slate-50 border p-3 md:p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6]">
                                    <option value="Karyawan Mapan" ${lead.segment === 'Karyawan Mapan' ? 'selected' : ''}>Karyawan Mapan</option>
                                    <option value="Investor Produktif" ${lead.segment === 'Investor Produktif' ? 'selected' : ''}>Investor Produktif</option>
                                    <option value="Orang Tua Mahasiswa" ${lead.segment === 'Orang Tua Mahasiswa' ? 'selected' : ''}>Orang Tua Mahasiswa</option>
                                    <option value="Fresh Married" ${lead.segment === 'Fresh Married' ? 'selected' : ''}>Fresh Married</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex space-x-3 pt-4 shrink-0">
                            <button type="button" id="btn-cancel-edit" class="flex-1 py-3 md:py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Batal</button>
                            <button type="submit" class="flex-2 w-full py-3 md:py-4 bg-[#2845D6] hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase shadow-xl transition-all tracking-widest">Simpan Perubahan</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.els.modalContainer.innerHTML = modalHTML;
        
        const closeModal = () => { this.els.modalContainer.innerHTML = ''; };
        document.getElementById('btn-close-edit-modal').addEventListener('click', closeModal);
        document.getElementById('btn-cancel-edit').addEventListener('click', closeModal);

        document.getElementById('editLeadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = e.target.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerText;
            
            try {
                btnSubmit.innerText = "Menyimpan...";
                btnSubmit.disabled = true;

                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());

                await ApiService.updateLeadData(data);
                
                this.showToast("Data lead berhasil diperbarui!");
                closeModal();
                this.els.drawerContainer.innerHTML = ''; 
                document.dispatchEvent(new CustomEvent('lead-updated'));
            } catch (error) {
                this.showToast("Gagal update lead: " + error.message, "error");
            } finally {
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
            }
        });
        if(window.lucide) window.lucide.createIcons();
    }
}