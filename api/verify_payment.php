<?php
// api/verify_payment.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$payment_id = $data['payment_id'] ?? null;
$payment_ids = $data['payment_ids'] ?? null;
$action = $data['action'] ?? null; // 'Approve' atau 'Reject'
$notes = $data['notes'] ?? '';

if (!$payment_ids && $payment_id) {
    $payment_ids = [$payment_id];
}

if (!$payment_ids || !is_array($payment_ids) || empty($payment_ids) || !in_array($action, ['Approve', 'Reject'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Data tidak lengkap (payment_id atau payment_ids dan action wajib diisi).']);
    exit;
}

// Fungsi untuk menghitung tanggal jatuh tempo berikutnya yang selalu jatuh pada tanggal 30
function getNext30thDate($currentDueStr = null) {
    $today = new DateTime('today');
    
    if ($currentDueStr) {
        $currentDue = new DateTime($currentDueStr);
        if ($currentDue >= $today) {
            $nextDue = clone $currentDue;
            $nextDue->modify('+1 month');
            $year = $nextDue->format('Y');
            $month = $nextDue->format('m');
            $day = ($month == '02') ? (date('L', mktime(0,0,0,1,1,$year)) ? '29' : '28') : '30';
            return "$year-$month-$day";
        }
    }
    
    $year = $today->format('Y');
    $month = $today->format('m');
    $dayOfToday = (int)$today->format('d');
    
    if ($dayOfToday < 25) {
        $day = ($month == '02') ? (date('L', mktime(0,0,0,1,1,$year)) ? '29' : '28') : '30';
        return "$year-$month-$day";
    } else {
        $today->modify('+1 month');
        $year = $today->format('Y');
        $month = $today->format('m');
        $day = ($month == '02') ? (date('L', mktime(0,0,0,1,1,$year)) ? '29' : '28') : '30';
        return "$year-$month-$day";
    }
}

try {
    $pdo->beginTransaction();

    $processed_count = 0;
    $notifications_to_send = [];

    foreach ($payment_ids as $p_id) {
        // 1. Ambil data payment confirmation
        $stmtPay = $pdo->prepare("SELECT developer_id, amount FROM payment_confirmations WHERE id = ? AND status = 'Pending'");
        $stmtPay->execute([$p_id]);
        $payment = $stmtPay->fetch();

        if (!$payment) {
            continue; // Skip jika tidak ditemukan atau sudah diproses
        }

        $developer_id = $payment['developer_id'];

        if ($action === 'Approve') {
            // 2. Update status pembayaran
            $stmtUpdatePay = $pdo->prepare("UPDATE payment_confirmations SET status = 'Approved', notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmtUpdatePay->execute([$notes, $p_id]);

            // Fetch current billing due date
            $stmtDev = $pdo->prepare("SELECT billing_due_date, nama_perusahaan, wa_number FROM developers WHERE id = ?");
            $stmtDev->execute([$developer_id]);
            $dev = $stmtDev->fetch();
            $current_due = $dev ? $dev['billing_due_date'] : null;

            $new_due_date = getNext30thDate($current_due);

            // 3. Update status developer & perpanjang masa aktif (tanggal 30)
            $stmtUpdateDev = $pdo->prepare("
                UPDATE developers 
                SET status_langganan = 'Active',
                    billing_due_date = ?
                WHERE id = ?
            ");
            $stmtUpdateDev->execute([$new_due_date, $developer_id]);

            $processed_count++;

            // Collect notification info
            if ($dev && !empty($dev['wa_number'])) {
                $formatted_date = date('d-m-Y', strtotime($new_due_date));
                $notifications_to_send[] = [
                    'target' => $dev['wa_number'],
                    'message' => "✅ *PEMBAYARAN DIVERIFIKASI*\n\n"
                               . "Halo, tim *{$dev['nama_perusahaan']}*.\n"
                               . "Konfirmasi pembayaran Anda untuk perpanjangan CRM Pro Syariah sebesar *Rp " . number_format($payment['amount'], 0, ',', '.') . "* telah berhasil diverifikasi oleh Admin.\n\n"
                               . "Masa aktif langganan Anda telah diperpanjang hingga:\n"
                               . "📅 *{$formatted_date}*\n\n"
                               . "Terima kasih atas kerja samanya. Selamat menggunakan layanan kami kembali!"
                ];
            }

        } else {
            // Jika REJECT (Tolak)
            // 2. Update status pembayaran
            $stmtUpdatePay = $pdo->prepare("UPDATE payment_confirmations SET status = 'Rejected', notes = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmtUpdatePay->execute([$notes, $p_id]);

            // 3. Update status developer menjadi 'Rejected' agar di dashboard mereka tahu pembayaran ditolak dan harus re-upload
            $stmtUpdateDev = $pdo->prepare("UPDATE developers SET status_langganan = 'Rejected' WHERE id = ?");
            $stmtUpdateDev->execute([$developer_id]);

            $processed_count++;

            // Fetch info no wa developer
            $stmtDevInfo = $pdo->prepare("SELECT nama_perusahaan, wa_number FROM developers WHERE id = ?");
            $stmtDevInfo->execute([$developer_id]);
            $dev = $stmtDevInfo->fetch();

            if ($dev && !empty($dev['wa_number'])) {
                $notifications_to_send[] = [
                    'target' => $dev['wa_number'],
                    'message' => "❌ *PEMBAYARAN DITOLAK*\n\n"
                               . "Halo, tim *{$dev['nama_perusahaan']}*.\n"
                               . "Mohon maaf, konfirmasi pembayaran Anda sebesar *Rp " . number_format($payment['amount'], 0, ',', '.') . "* ditolak oleh Admin.\n\n"
                               . "Alasan penolakan: \n"
                               . "> _\"{$notes}\"_\n\n"
                               . "Silakan periksa kembali struk transfer Anda dan unggah bukti transfer yang valid melalui dashboard aplikasi Anda."
                ];
            }
        }
    }

    if ($processed_count === 0) {
        http_response_code(404);
        echo json_encode(['message' => 'Konfirmasi pembayaran tidak ditemukan atau sudah diproses.']);
        $pdo->rollBack();
        exit;
    }

    $pdo->commit();

    // 4. Kirim semua notifikasi WA yang terkumpul setelah transaksi selesai
    foreach ($notifications_to_send as $notif) {
        sendWA($notif['target'], $notif['message']);
    }

    echo json_encode([
        'status' => 'success', 
        'message' => $processed_count . ' pembayaran berhasil diproses (' . ($action === 'Approve' ? 'disetujui' : 'ditolak') . ').'
    ]);

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
