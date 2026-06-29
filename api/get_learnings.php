<?php
// api/get_learnings.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$developer_id = $_GET['developer_id'] ?? null;

if (!$developer_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Developer ID wajib disediakan.']);
    exit;
}

try {
    // Ambil pembelajaran sukses spesifik tenant ini atau yang global (developer_id is NULL)
    // Batasi 10 entri terbaru
    $stmt = $pdo->prepare("
        SELECT id, buyer_job, property_segment, objections, successful_tactics 
        FROM sales_learnings 
        WHERE developer_id = ? OR developer_id IS NULL 
        ORDER BY developer_id DESC, id DESC 
        LIMIT 10
    ");
    $stmt->execute([$developer_id]);
    $learnings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($learnings);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get Learnings Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal mengambil data pembelajaran: ' . $e->getMessage()]);
}
?>
