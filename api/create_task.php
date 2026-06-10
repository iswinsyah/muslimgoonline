<?php
// api/create_task.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$title = $data['title'] ?? null;
$due_date = $data['due_date'] ?? null;

if (!$user_id || !$title) {
    http_response_code(400);
    echo json_encode(['message' => 'User ID dan Judul Tugas wajib diisi.']);
    exit;
}

try {
    // Get developer_id from user
    $stmtUser = $pdo->prepare("SELECT developer_id FROM users WHERE id = ?");
    $stmtUser->execute([$user_id]);
    $user = $stmtUser->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'User tidak ditemukan.']);
        exit;
    }
    $developer_id = $user['developer_id'];

    $stmt = $pdo->prepare(
        "INSERT INTO tasks (user_id, developer_id, title, due_date) VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([$user_id, $developer_id, $title, $due_date]);

    $new_task_id = $pdo->lastInsertId();
    
    $stmt_get = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
    $stmt_get->execute([$new_task_id]);
    $new_task = $stmt_get->fetch(PDO::FETCH_ASSOC);

    http_response_code(201);
    echo json_encode(['message' => 'Tugas berhasil dibuat!', 'task' => $new_task]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Create Task Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal membuat tugas.']);
}
?>