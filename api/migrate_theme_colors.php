<?php
// api/migrate_theme_colors.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    // 1. Cek apakah kolom theme_color sudah ada
    $stmt = $pdo->query("SHOW COLUMNS FROM developers LIKE 'theme_color'");
    $themeColorExists = $theme = $stmt->fetch();

    // 2. Cek apakah kolom sidebar_color sudah ada
    $stmt = $pdo->query("SHOW COLUMNS FROM developers LIKE 'sidebar_color'");
    $sidebarColorExists = $stmt->fetch();

    $messages = [];

    if (!$themeColorExists) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN theme_color VARCHAR(7) DEFAULT '#2845D6'");
        $messages[] = "Kolom 'theme_color' berhasil ditambahkan.";
    } else {
        $messages[] = "Kolom 'theme_color' sudah ada.";
    }

    if (!$sidebarColorExists) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN sidebar_color VARCHAR(7) DEFAULT '#1e3a8a'");
        $messages[] = "Kolom 'sidebar_color' berhasil ditambahkan.";
    } else {
        $messages[] = "Kolom 'sidebar_color' sudah ada.";
    }

    echo json_encode([
        "status" => "success",
        "message" => implode(" ", $messages)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal menjalankan migrasi: " . $e->getMessage()
    ]);
}
?>
