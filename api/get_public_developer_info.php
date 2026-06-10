<?php
// api/get_public_developer_info.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$company_slug = $_GET['slug'] ?? null;

if (!$company_slug) {
    http_response_code(400);
    echo json_encode(['message' => 'Referral slug tidak valid.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nama_perusahaan, app_name, logo_url FROM developers WHERE company_slug = ? AND status_langganan = 'Active'");
    $stmt->execute([$company_slug]);
    $info = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$info) {
        http_response_code(404);
        echo json_encode(['message' => 'Developer tidak ditemukan atau tidak aktif.']);
        exit;
    }
    
    if (empty($info['app_name'])) {
        $info['app_name'] = $info['nama_perusahaan'];
    }

    echo json_encode($info);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get Public Dev Info Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal memuat informasi developer.']);
}
?>