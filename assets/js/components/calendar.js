import { ApiService } from '../api.js';

export class CalendarComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        this.currentDate = new Date();
        this.tasks = [];
    }

    async render() {
        if (!this.container) return;
        
        // Tampilkan loading state
        this.container.innerHTML = `<div class="p-10 text-center"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto text-slate-400"></i><p class="text-xs text-slate-400 mt-2 font-bold">Memuat jadwal...</p></div>`;
        if (window.lucide) window.lucide.createIcons();

        try {
            // Ambil data tasks real dari server
            this.tasks = await ApiService.get(`get_tasks.php?user_id=${this.state.currentUser.id}`);
        } catch (error) {
            console.error("Gagal memuat task untuk kalender:", error);
            // Lanjut render kalender kosong jika gagal
        }
        
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Sunday
        
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        let html = `
            <div class="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 class="font-black text-slate-800 text-xl uppercase tracking-widest">${monthNames[month]} ${year}</h3>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jadwal Follow-up & Survey</p>
                    </div>
                    <div class="flex space-x-2">
                        <button id="prev-month" class="p-2 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-500"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
                        <button id="next-month" class="p-2 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-500"><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
                    </div>
                </div>
                
                <div class="grid grid-cols-7 text-center border-b border-slate-100 bg-slate-50/30">
                    ${['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => 
                        `<div class="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">${d}</div>`
                    ).join('')}
                </div>

                <div class="grid grid-cols-7 auto-rows-fr bg-slate-50">
        `;

        // Kotak kosong untuk hari sebelum tanggal 1
        for (let i = 0; i < startingDay; i++) {
            html += `<div class="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50"></div>`;
        }

        // Render Tanggal
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            
            // Cari task untuk tanggal ini
            // Format tanggal task di DB biasanya YYYY-MM-DD
            const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = this.tasks.filter(t => t.due_date === currentDayStr);

            const taskHtml = dayTasks.map(task => {
                const isCompleted = task.status === 'Completed';
                const colorClass = isCompleted ? 'bg-slate-100 border-slate-200 text-slate-400 decoration-slate-400 line-through' : 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200';
                return `
                    <div class="mt-1 p-1 px-1.5 border rounded-md cursor-pointer transition-colors ${colorClass}" title="${task.title}">
                        <p class="text-[8px] font-black truncate">${task.title}</p>
                    </div>
                `;
            }).join('');

            html += `
                <div class="min-h-[100px] border-b border-r border-slate-100 p-1 md:p-2 relative group hover:bg-white transition-colors">
                    <span class="text-xs font-bold ${isToday ? 'bg-teal-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-500'}">${day}</span>
                    <div class="mt-1 space-y-0.5 overflow-y-auto max-h-[70px] custom-scrollbar">
                        ${taskHtml}
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        
        // Event Listeners untuk Navigasi Bulan
        this.container.querySelector('#prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar(); // Re-render dengan bulan baru (data task tetap sama)
        });

        this.container.querySelector('#next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        if (window.lucide) window.lucide.createIcons();
    }
}