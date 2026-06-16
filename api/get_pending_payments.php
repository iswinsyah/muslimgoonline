<?php
// api/get_pending_payments.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");
require_once 'db_connect_pdo.php';

try {
    $stmt = $pdo->query("SELECT p.id, p.developer_id, d.nama_perusahaan, p.amount, p.payment_proof, p.status, p.created_at 
                         FROM payment_confirmations p 
                         JOIN developers d ON p.developer_id = d.id 
                         WHERE p.status = 'Pending' 
                         ORDER BY p.created_at DESC");
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $payments
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Gagal mengambil data pembayaran: ' . $e->getMessage()]);
}
?>
