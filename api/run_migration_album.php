<?php
// api/run_migration_album.php
// Run this script once on the production server to ensure the database schema is updated.

require_once 'db_connect_pdo.php';

header("Content-Type: application/json");

try {
    // 1. Cek kolom-kolom yang sudah ada di tabel developers
    $stmt = $pdo->query("DESCRIBE developers");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $actions = [];

    // 2. Tambah kolom property_album jika belum ada
    if (!in_array('property_album', $columns)) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN property_album TEXT NULL DEFAULT NULL");
        $actions[] = "Added column property_album";
    }

    // 3. Tambah kolom ai_todays_content jika belum ada
    if (!in_array('ai_todays_content', $columns)) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN ai_todays_content TEXT NULL DEFAULT NULL");
        $actions[] = "Added column ai_todays_content";
    }

    // 4. Tambah kolom calendar_started_at jika belum ada
    if (!in_array('calendar_started_at', $columns)) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN calendar_started_at TIMESTAMP NULL DEFAULT NULL");
        $actions[] = "Added column calendar_started_at";
    }

    if (empty($actions)) {
        echo json_encode([
            "status" => "success",
            "message" => "Database columns already exist. No migration needed."
        ]);
    } else {
        echo json_encode([
            "status" => "success",
            "message" => "Migration successfully executed.",
            "actions" => $actions
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Migration failed: " . $e->getMessage()
    ]);
}
?>
