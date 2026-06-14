<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    // 1. Ambil semua kolom yang ada di tabel developers
    $stmt = $pdo->query("DESCRIBE developers");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $added_columns = [];

    // 2. Tambah kolom wa_number jika belum ada
    if (!in_array('wa_number', $columns)) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN wa_number VARCHAR(20) NULL AFTER ai_creative_video");
        $added_columns[] = 'wa_number';
    }

    // 3. Tambah kolom ai_cs_instruction jika belum ada
    if (!in_array('ai_cs_instruction', $columns)) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN ai_cs_instruction TEXT NULL AFTER wa_number");
        $added_columns[] = 'ai_cs_instruction';
    }

    // 4. Tambah kolom fonnte_token jika belum ada
    if (!in_array('fonnte_token', $columns)) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN fonnte_token VARCHAR(255) NULL AFTER ai_cs_instruction");
        $added_columns[] = 'fonnte_token';
    }

    echo json_encode([
        "status" => "success",
        "message" => "Migrasi database berhasil dijalankan!",
        "added_columns" => $added_columns
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal menjalankan migrasi: " . $e->getMessage()
    ]);
}
?>
