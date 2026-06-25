<?php
// api/check_haikal.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$stmt = $pdo->prepare("SELECT id, developer_id, nama_user, username, password, status, role FROM users WHERE username = ?");
$stmt->execute(['haikal']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["status" => "not_found"]);
    exit;
}

// Check developer status
$stmtDev = $pdo->prepare("SELECT nama_perusahaan, status_langganan FROM developers WHERE id = ?");
$stmtDev->execute([$user['developer_id']]);
$dev = $stmtDev->fetch(PDO::FETCH_ASSOC);

// Test password
$test_password = '12345678';
$password_match = password_verify($test_password, $user['password']);

echo json_encode([
    "user" => [
        "id" => $user['id'],
        "developer_id" => $user['developer_id'],
        "nama_user" => $user['nama_user'],
        "username" => $user['username'],
        "status" => $user['status'],
        "role" => $user['role'],
        "password_hash" => $user['password']
    ],
    "developer" => $dev,
    "password_match_12345678" => $password_match
]);
?>
