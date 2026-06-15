<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $devs = $pdo->query("SELECT id, nama_perusahaan, wa_number, status_langganan, fonnte_token FROM developers")->fetchAll(PDO::FETCH_ASSOC);
    $users = $pdo->query("SELECT id, nama_user, username, role, developer_id FROM users")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode([
        'developers' => $devs,
        'users' => $users
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
