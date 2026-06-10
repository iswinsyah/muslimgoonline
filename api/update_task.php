<?php
// api/update_task.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);

$task_id = $data['task_id'] ?? null;
$user_id = $data['user_id'] ?? null; // For validation
$status = $data['status'] ?? null;

if (!$task_id || !$user_id || !$status) {
    http_response_code(400);
    echo json_encode(['message' => 'Data tidak lengkap.']);
    exit;
}

try {
    // Validate that the user owns the task
    $stmtCheck = $pdo->prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?");
    $stmtCheck->execute([$task_id, $user_id]);
    if (!$stmtCheck->fetch()) {
        http_response_code(403);
        echo json_encode(['message' => 'Akses ditolak. Anda tidak memiliki tugas ini.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE tasks SET status = ? WHERE id = ?");
    $stmt->execute([$status, $task_id]);

    echo json_encode(['message' => 'Status tugas berhasil diperbarui.']);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Update Task Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal memperbarui tugas.']);
}
?>