<?php
// api/get_client_usage.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect_pdo.php';

$developer_id = $_GET['developer_id'] ?? null;

if (!$developer_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Developer ID tidak valid.']);
    exit;
}

try {
    // 1. Get usage summary grouped by feature
    $stmtGroup = $pdo->prepare("SELECT 
        feature,
        SUM(gemini_prompt_tokens) as total_prompt,
        SUM(gemini_completion_tokens) as total_completion,
        SUM(gemini_total_tokens) as total_gemini,
        SUM(whatsapp_messages_sent) as total_whatsapp,
        COUNT(id) as total_requests
    FROM usage_logs
    WHERE developer_id = ?
    GROUP BY feature");
    
    $stmtGroup->execute([$developer_id]);
    $breakdown = $stmtGroup->fetchAll(PDO::FETCH_ASSOC);

    // 2. Get grand totals
    $stmtTotal = $pdo->prepare("SELECT 
        SUM(gemini_prompt_tokens) as grand_prompt,
        SUM(gemini_completion_tokens) as grand_completion,
        SUM(gemini_total_tokens) as grand_gemini,
        SUM(whatsapp_messages_sent) as grand_whatsapp
    FROM usage_logs
    WHERE developer_id = ?");
    
    $stmtTotal->execute([$developer_id]);
    $totals = $stmtTotal->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "developer_id" => $developer_id,
        "breakdown" => $breakdown,
        "totals" => [
            "grand_prompt" => intval($totals['grand_prompt'] ?? 0),
            "grand_completion" => intval($totals['grand_completion'] ?? 0),
            "grand_gemini" => intval($totals['grand_gemini'] ?? 0),
            "grand_whatsapp" => intval($totals['grand_whatsapp'] ?? 0)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Gagal mengambil data pemakaian: " . $e->getMessage()]);
}
?>
