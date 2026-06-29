<?php
// api/check_db_status.php
require_once 'db_connect_pdo.php';
header("Content-Type: application/json");

$developer_id = $_GET['developer_id'] ?? null;
if (!$developer_id) {
    echo json_encode(["error" => "developer_id is required"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nama_perusahaan, calendar_started_at, ai_content_calendar FROM developers WHERE id = ?");
    $stmt->execute([$developer_id]);
    $dev = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($dev) {
        $dev['calendar_length'] = 0;
        if (!empty($dev['ai_content_calendar'])) {
            $parsed = json_decode($dev['ai_content_calendar'], true);
            $dev['calendar_length'] = is_array($parsed) ? count($parsed) : 0;
            // truncate calendar to not leak token keys or large text
            $dev['ai_content_calendar'] = substr($dev['ai_content_calendar'], 0, 150) . '...';
        }
        echo json_encode($dev);
    } else {
        echo json_encode(["error" => "developer not found"]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
