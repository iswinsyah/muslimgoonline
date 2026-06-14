<?php
// api/get_team.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$developer_id = $_GET['developer_id'] ?? null;

if (!$developer_id) {
    echo json_encode([]);
    exit;
}

try {
    // Isolasi data: Hanya ambil tim milik developer yang sedang login
    $stmt = $pdo->prepare("SELECT id, nama_user, username, no_whatsapp, role, status FROM users WHERE developer_id = ? AND role IN ('Admin CS', 'Agent Freelance') ORDER BY id DESC");
    $stmt->execute([$developer_id]);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($members);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Gagal memuat data tim: " . $e->getMessage()]);
}
?>