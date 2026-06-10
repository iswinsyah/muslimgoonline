<?php
// api/update_developer_status.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'db_connect_pdo.php';

// Di aplikasi nyata, tambahkan validasi untuk memastikan hanya Super Admin yang bisa mengakses

$data = json_decode(file_get_contents("php://input"), true);
$developer_id = $data['developer_id'] ?? null;
$new_status = $data['status'] ?? null; // 'Active' or 'Rejected'

if (!$developer_id || !in_array($new_status, ['Active', 'Rejected'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Input tidak valid.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Update status di tabel developers
    $stmtDev = $pdo->prepare("UPDATE developers SET status_langganan = ? WHERE id = ?");
    $stmtDev->execute([$new_status, $developer_id]);

    // 2. Update status di tabel users untuk owner-nya
    $user_status = ($new_status === 'Active') ? 'Active' : 'Rejected';
    $stmtUser = $pdo->prepare("UPDATE users SET status = ? WHERE developer_id = ? AND role = 'Developer'");
    $stmtUser->execute([$user_status, $developer_id]);

    $pdo->commit();

    // Kirim notifikasi email ke developer (opsional, tapi sangat direkomendasikan)
    // mail($developer_email, "Status Pendaftaran Anda", "Pendaftaran Anda telah di-{$new_status}.");

    echo json_encode(['message' => "Pendaftaran perusahaan telah berhasil di-{$new_status}."]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log("Update Dev Status Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal memperbarui status pendaftar.']);
}
?>