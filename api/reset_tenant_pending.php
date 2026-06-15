<?php
// api/reset_tenant_pending.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    // Set status_langganan VQ Land kembali ke 'Pending'
    $stmt = $pdo->prepare("UPDATE developers SET status_langganan = 'Pending' WHERE nama_perusahaan LIKE '%VQ Land%'");
    $stmt->execute();

    echo json_encode([
        'status' => true,
        'message' => 'Status tenant VQ Land berhasil diset kembali ke Pending. Silakan test login kembali untuk verifikasi.'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => $e->getMessage()]);
}
?>
