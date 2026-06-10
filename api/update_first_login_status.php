<?php
// api/update_first_login_status.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['message' => 'User ID tidak valid.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE users SET is_first_login = 0 WHERE id = ?");
    $stmt->execute([$user_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Status login pertama berhasil diperbarui.']);
    } else {
        echo json_encode(['message' => 'Status tidak berubah (mungkin sudah diperbarui sebelumnya).']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Update First Login Status Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal memperbarui status: ' . $e->getMessage()]);
}
?>