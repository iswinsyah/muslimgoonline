<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS usage_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        developer_id INT NULL,
        feature VARCHAR(100) NOT NULL,
        gemini_prompt_tokens INT DEFAULT 0,
        gemini_completion_tokens INT DEFAULT 0,
        gemini_total_tokens INT DEFAULT 0,
        whatsapp_messages_sent INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE CASCADE
    )";
    
    $pdo->exec($sql);

    echo json_encode([
        "status" => "success",
        "message" => "Tabel usage_logs berhasil dibuat!"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal membuat tabel usage_logs: " . $e->getMessage()
    ]);
}
?>
