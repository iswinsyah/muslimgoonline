import { ApiService } from '../api.js';
import { UI } from '../ui.js';

export class TasksComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        this.ui = new UI();
        this.tasks = [];
    }

    async render() {
        if (!this.container) return;
        this.container.innerHTML = this.ui.renderLoading('Memuat tugas...');
        
        try {
            this.tasks = await ApiService.get(`get_tasks.php?user_id=${this.state.currentUser.id}`);
            this.container.innerHTML = this.renderLayout();
            this.attachEventListeners();
        } catch (error) {
            this.container.innerHTML = this.ui.renderError(`Gagal memuat tugas: ${error.message}`);
        }
    }

    renderLayout() {
        const taskItems = this.tasks.length > 0 
            ? this.tasks.map(task => this.createTaskItem(task)).join('')
            : `<div class="p-10 text-center text-slate-400">
                   <i data-lucide="check-circle-2" class="w-12 h-12 mx-auto mb-2"></i>
                   <p class="font-bold">Tidak ada tugas.</p>
                   <p class="text-sm">Klik "New Task" untuk memulai.</p>
               </div>`;

        return `
            <div class="max-w-4xl mx-auto space-y-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="font-black text-slate-800 text-xl uppercase tracking-widest">Task Management</h3>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kelola tugas harian Anda</p>
                    </div>
                    <button id="btn-new-task" class="bg-[#2845D6] text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i> New Task
                    </button>
                </div>

                <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div id="task-list" class="divide-y divide-slate-100">
                        ${taskItems}
                    </div>
                </div>
            </div>
            ${this.renderNewTaskModal()}
        `;
    }

    createTaskItem(task) {
        const statusColors = {
            'Pending': 'bg-orange-100 text-orange-600',
            'In Progress': 'bg-blue-100 text-blue-600',
            'Completed': 'bg-green-100 text-green-600'
        };
        const isCompleted = task.status === 'Completed';

        return `
            <div class="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group" data-task-id="${task.id}">
                <div class="flex items-center space-x-4 flex-1 min-w-0">
                    <button data-action="toggle-status" class="p-0 border-none bg-transparent cursor-pointer">
                        <i data-lucide="${isCompleted ? 'check-circle' : 'circle'}" class="w-6 h-6 ${isCompleted ? 'text-green-500' : 'text-slate-300'} group-hover:text-green-500 transition-colors"></i>
                    </button>
                    <div class="min-w-0">
                        <h4 class="font-bold text-slate-800 text-sm truncate ${isCompleted ? 'line-through text-slate-400' : ''}">${task.title}</h4>
                        ${task.due_date ? `
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center">
                            <i data-lucide="clock" class="w-3 h-3 mr-1"></i> ${new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        ` : ''}
                    </div>
                </div>
                <div class="flex items-center space-x-4 ml-4">
                    <select data-action="change-status" class="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-none outline-none appearance-none ${statusColors[task.status]}">
                        <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                    <button data-action="delete" class="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    renderNewTaskModal() {
        return `
            <div id="newTaskModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md hidden p-4">
                <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in">
                    <div class="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
                        <h3 class="text-base font-black uppercase tracking-tighter">Tugas Baru</h3>
                        <button type="button" data-action="close-modal" class="p-2 hover:bg-white/10 rounded-xl"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <form id="newTaskForm" class="p-6 space-y-4">
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Judul Tugas</label>
                            <input required name="title" type="text" placeholder="Contoh: Follow up Budi Santoso" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                        </div>
                        <div>
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tenggat Waktu (Opsional)</label>
                            <input name="due_date" type="date" class="w-full mt-1 bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#2845D6]" />
                        </div>
                        <div class="flex space-x-3 pt-4">
                            <button type="button" data-action="close-modal" class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Batal</button>
                            <button type="submit" class="flex-2 w-full py-3 bg-[#2845D6] hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase shadow-xl transition-all tracking-widest">Simpan Tugas</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('btn-new-task').addEventListener('click', () => this.ui.openModal('newTaskModal'));
        document.querySelectorAll('[data-action="close-modal"]').forEach(btn => btn.addEventListener('click', () => this.ui.closeModal('newTaskModal')));
        
        document.getElementById('newTaskForm').addEventListener('submit', (e) => this.createTask(e));

        const taskList = document.getElementById('task-list');
        taskList.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const action = button.dataset.action;
            const taskDiv = button.closest('[data-task-id]');
            const taskId = taskDiv.dataset.taskId;

            if (action === 'toggle-status') {
                const task = this.tasks.find(t => t.id == taskId);
                const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
                this.updateTaskStatus(taskId, newStatus);
            } else if (action === 'delete') {
                this.deleteTask(taskId);
            }
        });
        
        taskList.addEventListener('change', (e) => {
            const select = e.target.closest('select');
            if (!select || select.dataset.action !== 'change-status') return;
            
            const taskId = select.closest('[data-task-id]').dataset.taskId;
            const newStatus = select.value;
            this.updateTaskStatus(taskId, newStatus);
        });
    }

    async createTask(event) {
        event.preventDefault();
        const form = event.target;
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerText;
        button.disabled = true;
        button.innerText = 'Menyimpan...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.user_id = this.state.currentUser.id;

        try {
            const result = await ApiService.post('create_task.php', data);
            this.tasks.unshift(result.task); // Add to the top of the list
            this.ui.closeModal('newTaskModal');
            form.reset();
            this.rerenderTaskList();
            this.ui.showToast('Tugas berhasil dibuat!');
        } catch (error) {
            this.ui.showToast(`Gagal: ${error.message}`, 'error');
        } finally {
            button.disabled = false;
            button.innerText = originalText;
        }
    }

    async updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id == taskId);
        if (!task) return;
        
        const oldStatus = task.status;
        task.status = newStatus;
        this.rerenderTaskList(); // Optimistic update

        try {
            await ApiService.post('update_task.php', {
                task_id: taskId,
                user_id: this.state.currentUser.id,
                status: newStatus
            });
        } catch (error) {
            task.status = oldStatus; // Revert on failure
            this.rerenderTaskList();
            this.ui.showToast(`Gagal update: ${error.message}`, 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

        const taskIndex = this.tasks.findIndex(t => t.id == taskId);
        if (taskIndex === -1) return;

        const deletedTask = this.tasks.splice(taskIndex, 1); // Optimistic delete
        this.rerenderTaskList();

        try {
            await ApiService.post('delete_task.php', {
                task_id: taskId,
                user_id: this.state.currentUser.id
            });
            this.ui.showToast('Tugas berhasil dihapus.');
        } catch (error) {
            this.tasks.splice(taskIndex, 0, deletedTask[0]); // Revert on failure
            this.rerenderTaskList();
            this.ui.showToast(`Gagal hapus: ${error.message}`, 'error');
        }
    }
    
    rerenderTaskList() {
        const taskListContainer = document.getElementById('task-list');
        if (!taskListContainer) return;
        
        taskListContainer.innerHTML = this.tasks.length > 0 
            ? this.tasks.map(task => this.createTaskItem(task)).join('')
            : `<div class="p-10 text-center text-slate-400">
                   <i data-lucide="check-circle-2" class="w-12 h-12 mx-auto mb-2"></i>
                   <p class="font-bold">Tidak ada tugas.</p>
                   <p class="text-sm">Klik "New Task" untuk memulai.</p>
               </div>`;
        
        if (window.lucide) window.lucide.createIcons();
    }
}