import { ApiService } from '../api.js';

export class MenuManagementComponent {
    constructor(elementId, state) {
        this.container = document.getElementById(elementId);
        this.state = state;
        this.menus = state.menus.filter(m => m.menu_id !== 'menu-management' && m.menu_id !== 'settings'); 
        this.roles = ['Agent Freelance', 'Admin CS', 'Developer', 'Super Admin'];
    }

    render() {
        this.container.innerHTML = this.renderTable();
        this.attachEventListeners();
    }

    renderTable() {
        const title = 'Menu Management';
        const subtitle = 'Atur hak akses menu global untuk setiap role. Perubahan akan aktif setelah user login ulang.';
        
        const rows = this.menus.map(menu => {
            const checkboxes = this.roles.map(role => {
                const hasAccess = menu.roles.includes(role) || menu.roles.includes('All');

                // Super Admin is always checked and disabled.
                // If current user is a Developer, they cannot change Developer or Super Admin roles.
                let isDisabled = role === 'Super Admin';
                if (this.state.currentRole === 'Developer' && (role === 'Developer' || role === 'Super Admin')) {
                    isDisabled = true;
                }

                return `
                    <td class="p-4 text-center">
                        <input type="checkbox" 
                               data-menu-id="${menu.menu_id}"
                               data-role="${role}"
                               class="h-5 w-5 rounded border-gray-300 text-[#2845D6] focus:ring-[#2845D6]" 
                               ${hasAccess ? 'checked' : ''} 
                               ${isDisabled ? 'disabled' : ''}>
                    </td>
                `;
            }).join('');

            return `
                <tr class="border-b hover:bg-slate-50/50 transition-colors">
                    <td class="p-4 font-medium text-slate-800 flex items-center">
                        <i data-lucide="${menu.icon}" class="w-4 h-4 mr-3 text-slate-500"></i>
                        <span class="font-bold">${menu.label}</span>
                    </td>
                    ${checkboxes}
                </tr>
            `;
        }).join('');

        return `
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-md">
                <h2 class="text-xl font-black text-slate-800 uppercase tracking-wider">${title}</h2>
                <p class="text-sm text-slate-500 mt-1">${subtitle}</p>
                <div class="overflow-x-auto mt-6">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-black tracking-wider">
                            <tr>
                                <th class="p-4">Nama Menu</th>
                                <th class="p-4 text-center">Agent Freelance</th>
                                <th class="p-4 text-center">Admin CS</th>
                                <th class="p-4 text-center">Developer</th>
                                <th class="p-4 text-center">Super Admin</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">${rows}</tbody>
                    </table>
                </div>
                <div class="mt-6 text-right">
                    <button id="save-menu-access" class="px-6 py-3 bg-[#2845D6] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (window.lucide) {
            window.lucide.createIcons();
        }

        const saveButton = document.getElementById('save-menu-access');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveChanges());
        }
    }

    async saveChanges() {
        const saveButton = document.getElementById('save-menu-access');
        const originalButtonText = saveButton.innerHTML;
        saveButton.innerHTML = 'Menyimpan...';
        saveButton.disabled = true;

        const menuAccessMap = {};

        // Inisialisasi map dengan semua menu
        this.menus.forEach(menu => {
            menuAccessMap[menu.menu_id] = [];
        });

        // Kumpulkan data dari checkbox yang dicentang
        const checkedBoxes = this.container.querySelectorAll('input[type="checkbox"]:checked');
        checkedBoxes.forEach(box => {
            const menuId = box.dataset.menuId;
            const role = box.dataset.role;
            if (menuAccessMap[menuId]) {
                menuAccessMap[menuId].push(role);
            }
        });

        // Super Admin selalu punya akses
        Object.keys(menuAccessMap).forEach(menuId => {
            if (!menuAccessMap[menuId].includes('Super Admin')) {
                menuAccessMap[menuId].push('Super Admin');
            }
        });

        const payload = Object.keys(menuAccessMap).map(menuId => ({
            menu_id: menuId,
            roles: menuAccessMap[menuId]
        }));

        try {
            const finalPayload = {
                user_id: this.state.currentUser.id,
                menus: payload
            };
            // Gunakan metode post generik untuk memastikan kompatibilitas
            const response = await ApiService.post('save_menu_access.php', finalPayload);
            alert(response.message);
        } catch (error) {
            alert('Gagal menyimpan: ' + error.message);
        } finally {
            saveButton.innerHTML = originalButtonText;
            saveButton.disabled = false;
        }
    }
}