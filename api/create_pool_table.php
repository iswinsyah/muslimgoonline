<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS fonnte_tokens_pool (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(255) NOT NULL UNIQUE,
        wa_number VARCHAR(20) NOT NULL,
        status ENUM('Available', 'Used') DEFAULT 'Available',
        assigned_to_developer_id INT NULL,
        FOREIGN KEY (assigned_to_developer_id) REFERENCES developers(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo json_encode(['status' => true, 'message' => 'Table fonnte_tokens_pool created successfully!']);
} catch (Exception $e) {
    echo json_encode(['status' => false, 'error' => $e->getMessage()]);
}
?>
