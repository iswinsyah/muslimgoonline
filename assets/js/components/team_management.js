export class TeamManagementComponent {
    constructor(elementId, state) {
        this.container = document.getElementById(elementId);
        this.state = state;
    }
    render() { 
        this.container.innerHTML = `
            <div class="p-10 text-center font-bold text-slate-400 uppercase tracking-widest">
                Modul Team Management sedang dikembangkan.
            </div>`; 
    }
}