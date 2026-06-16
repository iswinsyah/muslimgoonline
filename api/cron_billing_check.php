<?php
// api/cron_billing_check.php
// Jalankan script ini via cron job harian (misal jam 00:05 dini hari)
header("Content-Type: text/plain");
require_once 'db_connect_pdo.php';
require_once 'config.php';

try {
    echo "=== MEMULAI CRON JOB BILLING CHECK: " . date('Y-m-d H:i:s') . " ===\n\n";

    // 1. Ambil semua developer yang berstatus Active
    $stmt = $pdo->query("SELECT id, nama_perusahaan, wa_number, billing_due_date, billing_amount FROM developers WHERE status_langganan = 'Active'");
    $tenants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $today = new DateTime(date('Y-m-d'));

    foreach ($tenants as $t) {
        if (empty($t['billing_due_date'])) {
            continue; // Skip jika belum diatur
        }

        $due_date = new DateTime($t['billing_due_date']);
        $interval = $today->diff($due_date);
        $days_diff = (int)$interval->format('%r%a'); // Menghasilkan angka negatif jika due_date sudah lewat

        $wa_number = $t['wa_number'];
        $nama = $t['nama_perusahaan'];
        $formatted_due = date('d-m-Y', strtotime($t['billing_due_date']));

        echo "Tenant: {$nama} | Jatuh Tempo: {$formatted_due} | Selisih Hari: {$days_diff}\n";

        // SKENARIO A: SUDAH JATUH TEMPO ATAU LEWAT (days_diff <= 0)
        if ($days_diff <= 0) {
            echo "-> BLOKIR: Masa aktif habis. Mengubah status ke Inactive.\n";

            // Update status ke Inactive
            $stmtUpdate = $pdo->prepare("UPDATE developers SET status_langganan = 'Inactive' WHERE id = ?");
            $stmtUpdate->execute([$t['id']]);

            // Kirim WhatsApp pemberitahuan blokir
            if (!empty($wa_number)) {
                $msg = "🚫 *LAYANAN DINONAKTIFKAN SEMENTARA*\n\n"
                     . "Halo, tim *{$nama}*.\n"
                     . "Kami informasikan bahwa masa aktif langganan aplikasi CRM Pro Syariah Anda telah *HABIS* per tanggal *{$formatted_due}*.\n\n"
                     . "Akses ke dashboard operasional telah dikunci sementara. Silakan lakukan transfer biaya langganan sebesar *Rp " . number_format($t['billing_amount'], 0, ',', '.') . "* ke rekening:\n"
                     . "🏦 *Bank Mandiri / BSI / Permata*\n"
                     . "💳 *No Rekening: 123-456-7890*\n"
                     . "👤 *Atas Nama: MuslimGo Online*\n\n"
                     . "Setelah transfer, silakan buka aplikasi Anda kembali dan unggah bukti transfer pada halaman blokir untuk mengaktifkan kembali layanan. Terima kasih!";
                sendWA($wa_number, $msg);
            }
        }
        // SKENARIO B: H-3 JATUH TEMPO (days_diff == 3)
        elseif ($days_diff === 3) {
            echo "-> PENGINGAT H-3: Mengirim pesan WhatsApp peringatan.\n";

            if (!empty($wa_number)) {
                $msg = "⚠️ *PENGINGAT JATUH TEMPO LANGGANAN*\n\n"
                     . "Halo, tim *{$nama}*.\n"
                     . "Masa aktif langganan aplikasi CRM Pro Syariah Anda akan berakhir dalam *3 hari lagi* pada tanggal *{$formatted_due}*.\n\n"
                     . "Agar operasional agen Anda tidak terganggu, mohon persiapkan pembayaran langganan bulanan sebesar *Rp " . number_format($t['billing_amount'], 0, ',', '.') . "*.\n\n"
                     . "Pembayaran dapat dikirim ke:\n"
                     . "🏦 *Bank Mandiri / BSI / Permata*\n"
                     . "💳 *No Rekening: 123-456-7890*\n"
                     . "👤 *Atas Nama: MuslimGo Online*\n\n"
                     . "Abaikan pesan ini jika Anda sudah melakukan transfer. Terima kasih!";
                sendWA($wa_number, $msg);
            }
        }
    }

    echo "\n=== CRON JOB SELESAI DENGAN SUKSES ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

function sendWA($target, $message) {
    $token = defined('FONNTE_ACCOUNT_TOKEN') ? FONNTE_ACCOUNT_TOKEN : '';
    if (empty($token)) return false;

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.fonnte.com/send',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => array(
            'target' => $target,
            'message' => $message,
        ),
        CURLOPT_HTTPHEADER => array(
            "Authorization: $token"
        ),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30
    ));
    $response = curl_exec($curl);
    curl_close($curl);
    return $response;
}
?>
