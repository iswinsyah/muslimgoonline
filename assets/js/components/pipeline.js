import { maskInfo } from '../helpers.js';
import { ApiService } from '../api.js';

export class PipelineComponent {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        this.statuses = ['NEW_LEAD', 'FOLLOW_UP', 'SURVEY', 'CLOSING'];
        this.searchTerm = '';
    }

    render() {
        if (!this.container) return;
        
        // Setup Layout (Hanya sekali)
        if (!this.container.querySelector('#pipeline-board')) {
            this.container.innerHTML = `
                <div class="w-full mb-4 px-1 shrink-0">
                    <div class="relative max-w-sm md:max-w-md">
                        <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                        <input type="text" id="lead-search" placeholder="Cari Nama, WA, atau NIK..." 
                            class="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#2845D6] shadow-sm transition-all" />
                    </div>
                </div>
                <div id="pipeline-board" class="flex-1 flex overflow-x-auto hide-scroll space-x-4 md:space-x-6 pb-4 snap-x"></div>
            `;

            // Event Listener Pencarian
            this.container.querySelector('#lead-search').addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.renderBoard();
            });
        }

        this.renderBoard();
    }

    renderBoard() {
        const board = this.container.querySelector('#pipeline-board');
        if (!board) return;
        
        board.innerHTML = '';

        this.statuses.forEach(status => {
            // Filter leads berdasarkan status DAN kata kunci pencarian
            const colLeads = this.state.leads.filter(l => {
                const matchesSearch = !this.searchTerm || 
                    (l.name && l.name.toLowerCase().includes(this.searchTerm)) ||
                    (l.phone && l.phone.includes(this.searchTerm)) ||
                    (l.nik && l.nik.includes(this.searchTerm));
                
                return l.status === status && matchesSearch;
            }) || [];
            
            const colDiv = document.createElement('div');
            colDiv.className = "bg-slate-200/50 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 flex flex-col min-h-[400px] md:min-h-[500px] w-[85vw] md:w-auto shrink-0 md:flex-1 snap-center";
            
            colDiv.addEventListener('dragover', (e) => e.preventDefault());
            colDiv.addEventListener('drop', (e) => this.handleDrop(e, status));

            const headerHtml = `
                <div class="p-4 border-b flex justify-between items-center bg-white/50 rounded-t-[1.5rem] md:rounded-t-[2rem]">
                    <h3 class="font-black text-[9px] text-slate-500 uppercase tracking-widest">${status.replace('_', ' ')}</h3>
                    <span class="bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full">${colLeads.length}</span>
                </div>
            `;

            const cardsContainer = document.createElement('div');
            cardsContainer.className = "p-3 flex-1 overflow-y-auto space-y-3 md:space-y-4 custom-scrollbar";

            colLeads.forEach(lead => {
                const card = document.createElement('div');
                card.draggable = true;
                card.className = "bg-white p-4 md:p-5 rounded-xl md:rounded-3xl shadow-sm cursor-grab hover:shadow-md border-l-4 border-[#2845D6] transition-all active:cursor-grabbing";
                
                card.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData("leadId", lead.id);
                    e.target.classList.add('opacity-50');
                });
                
                card.addEventListener('dragend', (e) => {
                    e.target.classList.remove('opacity-50');
                });

                card.addEventListener('click', () => {
                    const event = new CustomEvent('lead-selected', { detail: lead });
                    document.dispatchEvent(event);
                });

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-1 pointer-events-none">
                        <h4 class="font-black text-slate-800 text-[10px] md:text-[11px] truncate w-32">${lead.name}</h4>
                        ${lead.isLocked ? `<i data-lucide="lock" class="w-3 h-3 text-red-500 mt-0.5"></i>` : ''}
                    </div>
                    <div class="space-y-1 mt-2 pointer-events-none">
                       <div class="flex items-center text-[9px] md:text-[10px] text-slate-500 font-bold">
                            <i data-lucide="fingerprint" class="w-2.5 h-2.5 mr-2 text-slate-400"></i> 
                            ${maskInfo(lead.nik, lead.owner, this.state.currentRole, 'nik')}
                       </div>
                       <div class="flex items-center text-[9px] md:text-[10px] text-slate-400 font-medium">
                            <i data-lucide="phone" class="w-2.5 h-2.5 mr-2 text-slate-400"></i> 
                            ${maskInfo(lead.phone, lead.owner, this.state.currentRole, 'phone')}
                       </div>
                    </div>
                `;
                cardsContainer.appendChild(card);
            });

            colDiv.innerHTML = headerHtml;
            colDiv.appendChild(cardsContainer);
            board.appendChild(colDiv);
        });

        if (window.lucide) window.lucide.createIcons();
    }

    async handleDrop(e, newStatus) {
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");
        
        const leadIndex = this.state.leads.findIndex(l => l.id == leadId);
        if (leadIndex > -1) {
            const oldStatus = this.state.leads[leadIndex].status;
            
            this.state.leads[leadIndex].status = newStatus;
            this.state.leads[leadIndex].isLocked = (newStatus === 'SURVEY');
            
            this.render();

            try {
                await ApiService.updateLeadStatus(leadId, newStatus);
            } catch (error) {
                console.error("Failed to update status on server", error);
                this.state.leads[leadIndex].status = oldStatus;
                this.render();
                alert("Gagal menyimpan perubahan status ke server.");
            }
        }
    }
}