<?php
// api/get_global_learnings.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$admin_id = $_GET['admin_id'] ?? null;

if (!$admin_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Admin ID wajib disediakan.']);
    exit;
}

try {
    // 1. Validasi Super Admin
    $stmtUser = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmtUser->execute([$admin_id]);
    $user = $stmtUser->fetch();
    
    if (!$user || $user['role'] !== 'Super Admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Akses ditolak. Hanya Super Admin yang dapat mengakses modul konsultasi global.']);
        exit;
    }

    // 2. Query seluruh data pembelajaran dan gabungkan nama tenant
    $stmt = $pdo->query("
        SELECT 
            s.id, 
            s.buyer_job, 
            s.property_segment, 
            s.objections, 
            s.successful_tactics, 
            s.chat_snippet, 
            s.created_at,
            d.nama_perusahaan
        FROM sales_learnings s
        LEFT JOIN developers d ON s.developer_id = d.id
        ORDER BY s.id DESC
    ");
    $learnings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($learnings);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get Global Learnings Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal mengambil data pembelajaran global: ' . $e->getMessage()]);
}
?>
