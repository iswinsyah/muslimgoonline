<?php
// api/get_developer_settings.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$developer_id = $_GET['developer_id'] ?? null;

if (!$developer_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Developer ID tidak valid.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nama_perusahaan, company_slug, app_name, notification_email, logo_url, maintenance_mode, ai_persona_insight, ai_content_calendar, ai_creative_caption, ai_creative_visual, ai_creative_video FROM developers WHERE id = ?");
    $stmt->execute([$developer_id]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$settings) {
        http_response_code(404);
        echo json_encode(['message' => 'Pengaturan untuk developer ini tidak ditemukan.']);
        exit;
    }
    
    // Set default app_name if it's null or empty
    if (empty($settings['app_name'])) {
        $settings['app_name'] = $settings['nama_perusahaan'];
    }

    echo json_encode($settings);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get Settings Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal memuat pengaturan: ' . $e->getMessage()]);
}

?>