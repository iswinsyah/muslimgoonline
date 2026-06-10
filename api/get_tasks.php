<?php
// api/get_tasks.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    http_response_code(401);
    echo json_encode(['message' => 'User ID tidak valid.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($tasks);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get Tasks Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal memuat tugas.']);
}
?>