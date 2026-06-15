<?php
// api/disconnect_whatsapp.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);
$developer_id = $data['developer_id'] ?? null;

if (!$developer_id) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'ID Developer wajib diisi.']);
    exit;
}

try {
    // Kosongkan token & nomor WA di database
    $stmt = $pdo->prepare("UPDATE developers SET fonnte_token = NULL, wa_number = NULL WHERE id = ?");
    $stmt->execute([$developer_id]);

    echo json_encode([
        'status' => true,
        'message' => 'Koneksi WhatsApp berhasil diputuskan dari sistem.'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
