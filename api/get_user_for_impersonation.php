<?php
// api/get_user_for_impersonation.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once 'db_connect_pdo.php';

// Di aplikasi nyata, tambahkan validasi untuk memastikan hanya Super Admin yang bisa mengakses

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['message' => 'User ID tidak disediakan.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'User tidak ditemukan.']);
        exit;
    }

    unset($user['password']); // Jangan pernah kirim hash password

    echo json_encode(['user' => $user]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Impersonation Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal mengambil data user untuk penyamaran.']);
}
?>