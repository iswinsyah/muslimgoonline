<?php
// api/get_token_pool.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $stmt = $pdo->prepare("SELECT p.*, d.nama_perusahaan 
                           FROM fonnte_tokens_pool p 
                           LEFT JOIN developers d ON p.assigned_to_developer_id = d.id 
                           ORDER BY p.id DESC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Gagal memuat stok token: ' . $e->getMessage()]);
}