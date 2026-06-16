<?php
// api/create_payment_confirmation.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';
require_once 'config.php';

$developer_id = $_POST['developer_id'] ?? null;
$amount = $_POST['amount'] ?? null;
$payment_file = $_FILES['payment_proof'] ?? null;

if (!$developer_id || !$amount || !$payment_file) {
    http_response_code(400);
    echo json_encode(['message' => 'Semua data (Developer ID, nominal, dan bukti transfer) wajib diisi.']);
    exit;
}

// 1. Upload file bukti transfer
$upload_dir = '../uploads/payments/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$file_extension = pathinfo($payment_file['name'], PATHINFO_EXTENSION);
$safe_filename = "proof_" . $developer_id . "_" . time() . "." . $file_extension;
$upload_path = $upload_dir . $safe_filename;

if (!move_uploaded_file($payment_file['tmp_name'], $upload_path)) {
    http_response_code(500);
    echo json_encode(['message' => 'Gagal mengupload bukti pembayaran.']);
    exit;
}

$db_file_path = '/uploads/payments/' . $safe_filename;

try {
    $pdo->beginTransaction();

    // 2. Simpan ke tabel payment_confirmations
    $stmt = $pdo->prepare("INSERT INTO payment_confirmations (developer_id, amount, payment_proof, status) VALUES (?, ?, ?, 'Pending')");
    $stmt->execute([$developer_id, $amount, $db_file_path]);

    // 3. Update status_langganan di developers menjadi 'Pending' agar muncul screen verifikasi
    $stmtUpdate = $pdo->prepare("UPDATE developers SET status_langganan = 'Pending' WHERE id = ?");
    $stmtUpdate->execute([$developer_id]);

    // 4. Ambil nama tenant untuk notifikasi
    $stmtTenant = $pdo->prepare("SELECT nama_perusahaan FROM developers WHERE id = ?");
    $stmtTenant->execute([$developer_id]);
    $tenant = $stmtTenant->fetch();
    $nama_perusahaan = $tenant ? $tenant['nama_perusahaan'] : 'Unknown';

    $pdo->commit();

    // 5. Kirim Notifikasi WA ke Super Admin
    $target_admin = defined('SUPER_ADMIN_WA') ? SUPER_ADMIN_WA : '62895808626677';
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'];
    $link_bukti = $protocol . $host . $db_file_path;
    $link_admin = $protocol . $host . "/index.php#validation";

    $message = "📢 *KONFIRMASI PEMBAYARAN BARU*\n\n"
             . "Tenant: *{$nama_perusahaan}*\n"
             . "Nominal: *Rp " . number_format($amount, 0, ',', '.') . "*\n"
             . "Tanggal: " . date('d-m-Y H:i') . " WIB\n\n"
             . "Silakan periksa bukti transfer dan lakukan validasi di panel admin:\n"
             . "🔗 Bukti: {$link_bukti}\n"
             . "🔗 Validasi: {$link_admin}";

    sendWA($target_admin, $message);

    echo json_encode([
        'status' => 'success',
        'message' => 'Konfirmasi pembayaran berhasil dikirim. Menunggu verifikasi admin.'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['message' => 'Terjadi kesalahan di server: ' . $e->getMessage()]);
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
