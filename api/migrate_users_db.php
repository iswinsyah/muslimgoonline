<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $added_columns = [];

    if (!in_array('no_whatsapp', $columns)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN no_whatsapp VARCHAR(20) NULL AFTER email");
        $added_columns[] = 'no_whatsapp';
    }

    echo json_encode([
        "status" => "success",
        "message" => "Migrasi database users berhasil dijalankan!",
        "added_columns" => $added_columns
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal menjalankan migrasi users: " . $e->getMessage()
    ]);
}
?>
