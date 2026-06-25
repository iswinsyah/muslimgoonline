<?php
// api/update_haikal_password.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $new_password_hash = password_hash('12345678', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
    $stmt->execute([$new_password_hash, 'haikal']);
    
    echo json_encode(["status" => "success", "message" => "Password untuk user 'haikal' berhasil diubah menjadi '12345678'."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
