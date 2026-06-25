import { ApiService } from '../api.js';
import { UI } from '../ui.js';

export class ValidationComponent {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        this.ui = new UI();
        this.state = {
            pending: []
        };
    }

    async render() {
        this.container.innerHTML = this.ui.renderLoading('Memuat data validasi...');
        try {
            this.state.pending = await ApiService.getPendingDevelopers();
            
            // Ambil data pembayaran pending
            let pendingPayments = [];
            try {
                const res = await ApiService.get('get_pending_payments.php');
                pendingPayments = res.data || [];
            } catch (e) {
                console.error("Gagal memuat pembayaran pending:", e);
            }
            this.state.pendingPayments = pendingPayments;

            this.container.innerHTML = `
                <div class="space-y-8">
                    ${this.state.pending.length === 0 ? this.renderEmptyState() : this.renderTable()}
                    ${this.state.pendingPayments.length === 0 ? this.renderEmptyPaymentsState() : this.renderPaymentsTable()}
                </div>
            `;
            this.attachEventListeners();
        } catch (error) {
            this.container.innerHTML = this.ui.renderError('Gagal memuat data validasi.');
            console.error(error);
        }
    }

    renderEmptyState() {
        return `
            <div class="text-center p-10 bg-white rounded-2xl shadow-md">
                <i data-lucide="check-check" class="w-16 h-16 mx-auto text-green-500"></i>
                <h3 class="mt-4 text-lg font-bold text-slate-700">Tidak Ada Pendaftar Baru</h3>
                <p class="mt-1 text-sm text-slate-500">Semua pendaftaran sudah divalidasi.</p>
            </div>
        `;
    }

    renderEmptyPaymentsState() {
        return `
            <div class="text-center p-10 bg-white rounded-2xl shadow-md">
                <i data-lucide="wallet" class="w-16 h-16 mx-auto text-green-500"></i>
                <h3 class="mt-4 text-lg font-bold text-slate-700">Tidak Ada Tagihan Pending</h3>
                <p class="mt-1 text-sm text-slate-500">Semua konfirmasi transfer pembayaran bulanan sudah diproses.</p>
            </div>
        `;
    }

    renderTable() {
        const rows = this.state.pending.map(dev => `
            <tr class="border-b hover:bg-slate-50/50 transition-colors" data-id="${dev.id}">
                <td class="p-4 font-bold text-slate-700">${dev.nama_perusahaan}</td>
                <td class="p-4 text-slate-600">${dev.nama_pemilik}</td>
                <td class="p-4 text-slate-600">${dev.kontak}</td>
                <td class="p-4 text-slate-500 text-xs">${new Date(dev.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                <td class="p-4">
                    <div class="space-y-2">
                        <input type="text" placeholder="Token (Kosongkan = Auto AI)" class="fonnte-token-input w-full p-2 border rounded-lg text-[10px] font-mono shadow-sm focus:ring-1 focus:ring-teal-500 outline-none" />
                        <input type="text" placeholder="No WA (Kosongkan = Auto AI)" value="${dev.kontak}" class="wa-number-input w-full p-2 border rounded-lg text-[10px] font-mono shadow-sm focus:ring-1 focus:ring-teal-500 outline-none" />
                    </div>
                </td>
                <td class="p-4">
                    <a href="/${dev.bukti_pembayaran}" target="_blank" class="text-xs font-bold text-teal-600 hover:underline">Lihat Bukti</a>
                </td>
                <td class="p-4 flex items-center space-x-2">
                    <button data-action="approve" class="action-btn bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-sm transition-all">
                        <i data-lucide="check" class="w-4 h-4 mr-1.5"></i> Terima
                    </button>
                    <button data-action="reject" class="action-btn bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-sm transition-all">
                        <i data-lucide="x" class="w-4 h-4 mr-1.5"></i> Tolak
                    </button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-md">
                <h2 class="text-xl font-black text-slate-800 uppercase tracking-wider">Validasi Pendaftaran Perusahaan</h2>
                <p class="text-sm text-slate-500 mt-1">Setujui atau tolak pendaftaran perusahaan baru.</p>
                <div class="overflow-x-auto mt-6">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-black tracking-wider">
                            <tr>
                                <th class="p-4">Nama Perusahaan</th>
                                <th class="p-4">Nama Pemilik</th>
                                <th class="p-4">Kontak</th>
                                <th class="p-4">Tanggal Daftar</th>
                                <th class="p-4">Konfigurasi CS AI</th>
                                <th class="p-4">Pembayaran</th>
                                <th class="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderPaymentsTable() {
        const rows = this.state.pendingPayments.map(pay => `
            <tr class="border-b hover:bg-slate-50/50 transition-colors" data-payment-id="${pay.id}">
                <td class="p-4">
                    <input type="checkbox" class="payment-checkbox w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" value="${pay.id}" />
                </td>
                <td class="p-4 font-bold text-slate-700">${pay.nama_perusahaan}</td>
                <td class="p-4 font-black text-slate-700">Rp ${parseFloat(pay.amount).toLocaleString('id-ID')}</td>
                <td class="p-4 text-slate-500 text-xs">${new Date(pay.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</td>
                <td class="p-4">
                    <a href="${pay.payment_proof}" target="_blank" class="text-xs font-bold text-blue-600 hover:underline flex items-center">
                        <i data-lucide="image" class="w-4 h-4 mr-1"></i> Lihat Struk
                    </a>
                </td>
                <td class="p-4">
                    <input type="text" placeholder="Alasan penolakan..." class="reject-notes-input w-full p-2 border rounded-lg text-xs shadow-sm focus:ring-1 focus:ring-red-500 outline-none" />
                </td>
                <td class="p-4 flex items-center space-x-2">
                    <button data-action="approve-payment" class="action-payment-btn bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-md transition-all animate-none">
                        <i data-lucide="check" class="w-4 h-4 mr-1"></i> Terima
                    </button>
                    <button data-action="reject-payment" class="action-payment-btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-md transition-all animate-none">
                        <i data-lucide="x" class="w-4 h-4 mr-1"></i> Tolak
                    </button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="bg-white p-6 md:p-8 rounded-2xl shadow-md mt-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-black text-slate-800 uppercase tracking-wider">Validasi Pembayaran Bulanan</h2>
                        <p class="text-sm text-slate-500 mt-1">Verifikasi bukti transfer biaya langganan bulanan dari para tenant.</p>
                    </div>
                    <!-- Bulk Action Controls -->
                    <div id="bulk-payment-bar" class="hidden flex items-center space-x-3 bg-blue-50/80 px-4 py-2.5 rounded-2xl border border-blue-100 animate-in slide-in-from-top-4 duration-300">
                        <span class="text-[10px] font-black text-blue-800 uppercase tracking-wider" id="selected-payments-count">0 terpilih</span>
                        <button id="btn-bulk-approve" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center shadow-sm transition-all active:scale-95">
                            <i data-lucide="check-square" class="w-3.5 h-3.5 mr-1"></i> Terima Terpilih
                        </button>
                        <button id="btn-bulk-reject" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center shadow-sm transition-all active:scale-95">
                            <i data-lucide="x-square" class="w-3.5 h-3.5 mr-1"></i> Tolak Terpilih
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto mt-6">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-xs text-slate-500 uppercase font-black tracking-wider">
                            <tr>
                                <th class="p-4 w-10">
                                    <input type="checkbox" id="select-all-payments" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                </th>
                                <th class="p-4">Nama Perusahaan</th>
                                <th class="p-4">Nominal</th>
                                <th class="p-4">Tanggal Kirim</th>
                                <th class="p-4">Bukti Transfer</th>
                                <th class="p-4">Catatan (Bila Ditolak)</th>
                                <th class="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        if (window.lucide) window.lucide.createIcons();

        // Event listener pendaftaran baru
        this.container.querySelectorAll('.action-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                const row = btn.closest('tr');
                const developerId = row.dataset.id;
                const action = btn.dataset.action;
                const status = action === 'approve' ? 'Active' : 'Rejected';

                const fonnteToken = row.querySelector('.fonnte-token-input').value;
                const waNumber = row.querySelector('.wa-number-input').value;

                const companyName = row.querySelector('td').innerText;

                if (!confirm(`Apakah Anda yakin ingin ${action} pendaftaran untuk "${companyName}"?`)) {
                    return;
                }

                btn.disabled = true;
                btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>`;
                if (window.lucide) window.lucide.createIcons();

                try {
                    const response = await ApiService.post('update_developer_status.php', {
                        developer_id: developerId,
                        status: status,
                        fonnte_token: fonnteToken,
                        wa_number: waNumber
                    });

                    this.ui.showToast(response.message);
                    
                    row.style.transition = 'opacity 0.5s';
                    row.style.opacity = '0';
                    setTimeout(() => {
                        row.remove();
                        this.render();
                    }, 500);

                } catch (error) {
                    this.ui.showToast(`Gagal: ${error.message}`, 'error');
                    btn.disabled = false;
                    btn.innerHTML = `<i data-lucide="${action === 'approve' ? 'check' : 'x'}" class="w-4 h-4"></i>`;
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        });

        // Checkbox handling
        const selectAllCheckbox = this.container.querySelector('#select-all-payments');
        const paymentCheckboxes = this.container.querySelectorAll('.payment-checkbox');
        const bulkBar = this.container.querySelector('#bulk-payment-bar');
        const selectedCountSpan = this.container.querySelector('#selected-payments-count');

        const updateBulkBarVisibility = () => {
            if (!bulkBar || !selectedCountSpan) return;
            const checkedBoxes = this.container.querySelectorAll('.payment-checkbox:checked');
            const count = checkedBoxes.length;
            if (count > 0) {
                selectedCountSpan.innerText = `${count} terpilih`;
                bulkBar.classList.remove('hidden');
            } else {
                bulkBar.classList.add('hidden');
            }
        };

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                paymentCheckboxes.forEach(cb => {
                    cb.checked = isChecked;
                });
                updateBulkBarVisibility();
            });
        }

        paymentCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                if (selectAllCheckbox) {
                    const allChecked = Array.from(paymentCheckboxes).every(checkbox => checkbox.checked);
                    selectAllCheckbox.checked = allChecked;
                }
                updateBulkBarVisibility();
            });
        });

        // Event listener bulk action buttons
        const btnBulkApprove = this.container.querySelector('#btn-bulk-approve');
        const btnBulkReject = this.container.querySelector('#btn-bulk-reject');

        const processBulkPayment = async (action, notes = '') => {
            const checkedBoxes = this.container.querySelectorAll('.payment-checkbox:checked');
            const paymentIds = Array.from(checkedBoxes).map(cb => cb.value);
            
            if (paymentIds.length === 0) return;

            const btn = action === 'Approve' ? btnBulkApprove : btnBulkReject;
            const originalHTML = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 mr-1 animate-spin"></i> Memproses...`;
            if (window.lucide) window.lucide.createIcons();

            try {
                const response = await ApiService.post('verify_payment.php', {
                    payment_ids: paymentIds,
                    action: action,
                    notes: notes
                });

                this.ui.showToast(response.message);
                this.render(); // Reload component to reflect updates
            } catch (error) {
                this.ui.showToast(`Gagal: ${error.message}`, 'error');
                btn.disabled = false;
                btn.innerHTML = originalHTML;
                if (window.lucide) window.lucide.createIcons();
            }
        };

        if (btnBulkApprove) {
            btnBulkApprove.addEventListener('click', async () => {
                const checkedBoxes = this.container.querySelectorAll('.payment-checkbox:checked');
                if (confirm(`Apakah Anda yakin ingin menyetujui ${checkedBoxes.length} pembayaran terpilih?`)) {
                    await processBulkPayment('Approve');
                }
            });
        }

        if (btnBulkReject) {
            btnBulkReject.addEventListener('click', async () => {
                const checkedBoxes = this.container.querySelectorAll('.payment-checkbox:checked');
                const notes = prompt(`Masukkan alasan penolakan untuk ${checkedBoxes.length} pembayaran terpilih:`);
                if (notes === null) return; // User cancelled prompt
                if (!notes.trim()) {
                    alert('Alasan penolakan wajib diisi!');
                    return;
                }
                await processBulkPayment('Reject', notes);
            });
        }

        // Event listener pembayaran bulanan individual
        this.container.querySelectorAll('.action-payment-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                const row = btn.closest('tr');
                const paymentId = row.dataset.paymentId;
                const actionType = btn.dataset.action;
                const action = actionType === 'approve-payment' ? 'Approve' : 'Reject';
                const notes = row.querySelector('.reject-notes-input').value;
                const companyName = row.querySelector('td:nth-child(2)').innerText;

                if (action === 'Reject' && !notes.trim()) {
                    alert('Harap isi alasan penolakan pada kolom catatan.');
                    return;
                }

                if (!confirm(`Apakah Anda yakin ingin ${action === 'Approve' ? 'menyetujui' : 'menolak'} pembayaran dari "${companyName}"?`)) {
                    return;
                }

                btn.disabled = true;
                btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>`;
                if (window.lucide) window.lucide.createIcons();

                try {
                    const response = await ApiService.post('verify_payment.php', {
                        payment_id: paymentId,
                        action: action,
                        notes: notes
                    });

                    this.ui.showToast(response.message);

                    row.style.transition = 'opacity 0.5s';
                    row.style.opacity = '0';
                    setTimeout(() => {
                        row.remove();
                        this.render();
                    }, 500);

                } catch (error) {
                    this.ui.showToast(`Gagal: ${error.message}`, 'error');
                    btn.disabled = false;
                    btn.innerHTML = `<i data-lucide="${action === 'Approve' ? 'check' : 'x'}" class="w-4 h-4"></i>`;
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        });
    }
}