<?php
// api/delete_lead.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);
$lead_id = $data['lead_id'] ?? null;
$user_id = $data['user_id'] ?? null;

if (!$lead_id || !$user_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Data tidak lengkap.']);
    exit;
}

try {
    // Cek kepemilikan/hak akses
    $stmtUser = $pdo->prepare("SELECT role, developer_id FROM users WHERE id = ?");
    $stmtUser->execute([$user_id]);
    $user = $stmtUser->fetch();

    $stmtLead = $pdo->prepare("SELECT owner_id, developer_id FROM leads WHERE id = ?");
    $stmtLead->execute([$lead_id]);
    $lead = $stmtLead->fetch();

    if (!$lead) {
        http_response_code(404);
        echo json_encode(['message' => 'Lead tidak ditemukan.']);
        exit;
    }

    $canDelete = false;
    if ($user['role'] === 'Super Admin') {
        $canDelete = true;
    } elseif ($user['role'] === 'Developer' && $user['developer_id'] == $lead['developer_id']) {
        $canDelete = true;
    } elseif ($lead['owner_id'] == $user_id) {
        $canDelete = true;
    }

    if (!$canDelete) {
        http_response_code(403);
        echo json_encode(['message' => 'Anda tidak memiliki izin menghapus lead ini.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM leads WHERE id = ?");
    $stmt->execute([$lead_id]);

    echo json_encode(['message' => 'Lead berhasil dihapus.']);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Delete Lead Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal menghapus lead.']);
}
?>