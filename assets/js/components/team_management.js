import { ApiService } from '../api.js';

export class TeamManagementComponent {
    constructor(elementId, state) {
        this.container = document.getElementById(elementId);
        this.state = state;
    }

    async render() { 
        this.container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-8 animate-in">
                <!-- Header -->
                <div class="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 class="text-lg md:text-xl font-black text-slate-800 uppercase tracking-widest italic">Manajemen Tim</h3>
                        <p class="text-xs text-slate-500 font-medium mt-1">Kelola akses Agent Freelance dan Admin CS di bawah naungan Anda.</p>
                    </div>
                    <button id="btn-add-member" class="bg-[#2845D6] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                        + Tambah Anggota
                    </button>
                </div>

                <!-- Table -->
                <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <tr>
                                    <th class="px-6 py-5">Nama Anggota</th>
                                    <th class="px-6 py-5">Username</th>
                                    <th class="px-6 py-5">WhatsApp</th>
                                    <th class="px-6 py-5">Role</th>
                                    <th class="px-6 py-5 text-center">Status</th>
                                    <th class="px-6 py-5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="team-list-body" class="text-xs md:text-sm font-bold">
                                <tr class="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <td colspan="6" class="px-6 py-10 text-center text-slate-400 italic font-medium">Memuat data tim...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Modal Tambah Anggota -->
            <div id="addMemberModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md hidden p-4">
                <div class="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in">
                    <div class="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
                        <h3 class="text-base font-black uppercase tracking-tighter">Daftarkan Anggota Tim</h3>
                        <button type="button" id="btn-close-member-modal" class="p-2 hover:bg-white/10 rounded-xl"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <form id="addMemberForm" class="p-6 space-y-4">
                        <input type="hidden" name="developer_id" value="${this.state.currentUser.developer_id}">
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                            <input required name="nama_user" type="text" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                                <input required name="username" type="text" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                            </div>
                            <div>
                                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                                <select name="role" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]">
                                    <option value="Admin CS">Admin CS</option>
                                    <option value="Agent Freelance">Agent Freelance</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nomor WhatsApp</label>
                            <input required name="no_whatsapp" type="text" placeholder="Contoh: 08123456789" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Password Default</label>
                            <input required name="password" type="password" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                        </div>
                        <div class="flex space-x-3 pt-4">
                            <button type="button" id="btn-cancel-member" class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Batal</button>
                            <button type="submit" class="flex-2 w-full py-3 bg-[#2845D6] hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase shadow-xl transition-all tracking-widest">Daftarkan Akun</button>
                        </div>
                    </form>
                </div>
            </div>`;

        this.attachEventListeners();
        await this.loadTeamData();
    }

    async loadTeamData() {
        const tbody = document.getElementById('team-list-body');
        try {
            // Developer hanya bisa melihat timnya sendiri (Isolasi data)
            const members = await ApiService.get(`get_team.php?developer_id=${this.state.currentUser.developer_id}`);
            
            if (members.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-slate-400 italic">Belum ada tim. Silakan tambah anggota.</td></tr>`;
                return;
            }

            tbody.innerHTML = members.map(m => `
                <tr class="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 text-slate-800">${m.nama_user}</td>
                    <td class="px-6 py-4 text-slate-500 font-mono">${m.username}</td>
                    <td class="px-6 py-4 text-slate-600 font-medium">${m.no_whatsapp || '-'}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">${m.role}</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="px-2 py-1 ${m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded text-[9px] font-black uppercase">${m.status}</span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-2">
                        <button class="text-blue-600 hover:underline text-[10px] font-black uppercase">Edit</button>
                        <button class="text-red-600 hover:underline text-[10px] font-black uppercase">Nonaktif</button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-red-400">Gagal memuat data tim.</td></tr>`;
        }
        if (window.lucide) window.lucide.createIcons();
    }

    attachEventListeners() {
        const modal = document.getElementById('addMemberModal');
        const form = document.getElementById('addMemberForm');

        document.getElementById('btn-add-member').addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        document.getElementById('btn-close-member-modal').addEventListener('click', () => modal.classList.add('hidden'));
        document.getElementById('btn-cancel-member').addEventListener('click', () => modal.classList.add('hidden'));

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Mendaftarkan...';

            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                await ApiService.post('create_member.php', data);
                
                alert('Anggota tim berhasil didaftarkan!');
                modal.classList.add('hidden');
                form.reset();
                await this.loadTeamData();
            } catch (error) {
                alert('Gagal: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Daftarkan Akun';
            }
        });

        if (window.lucide) window.lucide.createIcons();
    }
}