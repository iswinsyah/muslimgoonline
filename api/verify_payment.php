<?php
// api/verify_payment.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$payment_id = $data['payment_id'] ?? null;
$action = $data['action'] ?? null; // 'Approve' atau 'Reject'
$notes = $data['notes'] ?? '';

if (!$payment_id || !in_array($action, ['Approve', 'Reject'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Data tidak lengkap (payment_id dan action wajib diisi).']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Ambil data payment confirmation
    $stmtPay = $pdo->prepare("SELECT developer_id, amount FROM payment_confirmations WHERE id = ? AND status = 'Pending'");
    $stmtPay->execute([$payment_id]);
    $payment = $stmtPay->fetch();

    if (!$payment) {
        http_response_code(404);
        echo json_encode(['message' => 'Konfirmasi pembayaran tidak ditemukan atau sudah diproses.']);
        $pdo->rollBack();
        exit;
    }

    $developer_id = $payment['developer_id'];

    if ($action === 'Approve') {
        // 2. Update status pembayaran
        $stmtUpdatePay = $pdo->prepare("UPDATE payment_confirmations SET status = 'Approved', notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmtUpdatePay->execute([$notes, $payment_id]);

        // 3. Update status developer & perpanjang masa aktif (+30 hari)
        // Logika: jika jatuh tempo sudah lewat/NULL, set 30 hari dari HARI INI. Jika masih di masa depan, tambah 30 hari dari jatuh tempo saat ini.
        $stmtUpdateDev = $pdo->prepare("
            UPDATE developers 
            SET status_langganan = 'Active',
                billing_due_date = CASE 
                    WHEN billing_due_date IS NULL OR billing_due_date < CURRENT_DATE() 
                    THEN DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY) 
                    ELSE DATE_ADD(billing_due_date, INTERVAL 30 DAY) 
                END 
            WHERE id = ?
        ");
        $stmtUpdateDev->execute([$developer_id]);

        // 4. Ambil tanggal jatuh tempo terbaru & no wa developer
        $stmtDevInfo = $pdo->prepare("SELECT nama_perusahaan, wa_number, billing_due_date FROM developers WHERE id = ?");
        $stmtDevInfo->execute([$developer_id]);
        $dev = $stmtDevInfo->fetch();

        $pdo->commit();

        // 5. Kirim Notifikasi WA Sukses ke Developer
        if ($dev && !empty($dev['wa_number'])) {
            $formatted_date = date('d-m-Y', strtotime($dev['billing_due_date']));
            $msg = "✅ *PEMBAYARAN DIVERIFIKASI*\n\n"
                 . "Halo, tim *{$dev['nama_perusahaan']}*.\n"
                 . "Konfirmasi pembayaran Anda untuk perpanjangan CRM Pro Syariah sebesar *Rp " . number_format($payment['amount'], 0, ',', '.') . "* telah berhasil diverifikasi oleh Admin.\n\n"
                 . "Masa aktif langganan Anda telah diperpanjang hingga:\n"
                 . "📅 *{$formatted_date}*\n\n"
                 . "Terima kasih atas kerja samanya. Selamat menggunakan layanan kami kembali!";
            sendWA($dev['wa_number'], $msg);
        }

        echo json_encode(['status' => 'success', 'message' => 'Pembayaran berhasil disetujui dan masa aktif diperpanjang.']);

    } else {
        // Jika REJECT (Tolak)
        // 2. Update status pembayaran
        $stmtUpdatePay = $pdo->prepare("UPDATE payment_confirmations SET status = 'Rejected', notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmtUpdatePay->execute([$notes, $payment_id]);

        // 3. Update status developer menjadi 'Rejected' agar di dashboard mereka tahu pembayaran ditolak dan harus re-upload
        $stmtUpdateDev = $pdo->prepare("UPDATE developers SET status_langganan = 'Rejected' WHERE id = ?");
        $stmtUpdateDev->execute([$developer_id]);

        // 4. Ambil info no wa developer
        $stmtDevInfo = $pdo->prepare("SELECT nama_perusahaan, wa_number FROM developers WHERE id = ?");
        $stmtDevInfo->execute([$developer_id]);
        $dev = $stmtDevInfo->fetch();

        $pdo->commit();

        // 5. Kirim Notifikasi WA Penolakan ke Developer
        if ($dev && !empty($dev['wa_number'])) {
            $msg = "❌ *PEMBAYARAN DITOLAK*\n\n"
                 . "Halo, tim *{$dev['nama_perusahaan']}*.\n"
                 . "Mohon maaf, konfirmasi pembayaran Anda sebesar *Rp " . number_format($payment['amount'], 0, ',', '.') . "* ditolak oleh Admin.\n\n"
                 . "Alasan penolakan: \n"
                 . "> _\"{$notes}\"_\n\n"
                 . "Silakan periksa kembali struk transfer Anda dan unggah bukti transfer yang valid melalui dashboard aplikasi Anda.";
            sendWA($dev['wa_number'], $msg);
        }

        echo json_encode(['status' => 'success', 'message' => 'Pembayaran berhasil ditolak. Tenant telah dinotifikasi.']);
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['message' => 'Terjadi kesalahan: ' . $e->getMessage()]);
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
