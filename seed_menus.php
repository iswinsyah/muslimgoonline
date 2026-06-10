<?php
// PENTING: HAPUS FILE INI SETELAH SELESAI DIJALANKAN SEKALI!

require_once __DIR__ . '/api/db_connect_pdo.php';

try {
    echo "<h1>Memulai Inisialisasi Menu...</h1>";

    // 1. Hapus tabel lama jika ada, untuk memastikan data bersih
    $pdo->exec("DROP TABLE IF EXISTS app_menus");
    echo "<p>Tabel 'app_menus' lama (jika ada) berhasil dihapus.</p>";

    // 2. Buat struktur tabel baru
    $createTableSql = "
    CREATE TABLE `app_menus` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `menu_id` VARCHAR(50) NOT NULL UNIQUE,
      `label` VARCHAR(100) NOT NULL,
      `icon` VARCHAR(50) NOT NULL,
      `allowed_roles` JSON NOT NULL,
      `sort_order` INT DEFAULT 0
    );";
    $pdo->exec($createTableSql);
    echo "<p style='color: green;'>✅ Tabel 'app_menus' berhasil dibuat.</p>";

    // 3. Isi tabel dengan data menu default
    $menus = [
        // Kategori 1: Operasional Harian
        [
            'menu_id' => 'pipeline', 'label' => 'Lead & Pipeline', 'icon' => 'layout-dashboard',
            'allowed_roles' => json_encode(['All']), 'sort_order' => 10
        ],
        [
            'menu_id' => 'tasks', 'label' => 'Task Management', 'icon' => 'check-square',
            'allowed_roles' => json_encode(['All']), 'sort_order' => 20
        ],
        [
            'menu_id' => 'calendar', 'label' => 'Calendar', 'icon' => 'calendar',
            'allowed_roles' => json_encode(['All']), 'sort_order' => 30
        ],
        [
            'menu_id' => 'ai-lead', 'label' => 'Lead Analyzer', 'icon' => 'brain-circuit',
            'allowed_roles' => json_encode(['All']), 'sort_order' => 40
        ],
        [
            'menu_id' => 'ai-objection', 'label' => 'Objection Gen', 'icon' => 'shield-alert',
            'allowed_roles' => json_encode(['All']), 'sort_order' => 50
        ],
        [
            'menu_id' => 'reporting', 'label' => 'Weekly Report', 'icon' => 'file-bar-chart',
            'allowed_roles' => json_encode(['Developer', 'Admin CS', 'Super Admin']), 'sort_order' => 60
        ],
        
        // Kategori 2: Strategi & Konten
        [
            'menu_id' => 'persona', 'label' => 'Buyer Persona', 'icon' => 'user-check',
            'allowed_roles' => json_encode(['Developer', 'Admin CS', 'Super Admin']), 'sort_order' => 70
        ],
        [
            'menu_id' => 'ai-creative', 'label' => 'Creative Suite', 'icon' => 'sparkles',
            'allowed_roles' => json_encode(['All']), 'sort_order' => 80
        ],
        [
            'menu_id' => 'ai-content-calendar', 'label' => 'AI Content Calendar', 'icon' => 'calendar-days',
            'allowed_roles' => json_encode(['Developer', 'Admin CS', 'Super Admin']), 'sort_order' => 90
        ],
        
        // Kategori 3: Manajemen Lanjutan
        [
            'menu_id' => 'ai-engine', 'label' => 'AI Engine Config', 'icon' => 'database',
            'allowed_roles' => json_encode(['Super Admin']), 'sort_order' => 100
        ],
        [
            'menu_id' => 'client-management', 'label' => 'Client Management', 'icon' => 'building-2',
            'allowed_roles' => json_encode(['Super Admin']), 'sort_order' => 110
        ],
        [
            'menu_id' => 'validation', 'label' => 'Validasi Pendaftar', 'icon' => 'shield-check',
            'allowed_roles' => json_encode(['Super Admin']), 'sort_order' => 120
        ],
        [
            'menu_id' => 'portfolio', 'label' => 'Global Portfolio', 'icon' => 'globe',
            'allowed_roles' => json_encode(['Super Admin', 'Developer']), 'sort_order' => 130
        ],

        // Kategori 4: Administrasi Sistem
        [
            'menu_id' => 'menu-management', 'label' => 'Menu Management', 'icon' => 'list-checks',
            'allowed_roles' => json_encode(['Super Admin']), 'sort_order' => 140
        ],
        [
            'menu_id' => 'impersonation', 'label' => 'Mode Penyamaran', 'icon' => 'user-cog',
            'allowed_roles' => json_encode(['Super Admin']), 'sort_order' => 150
        ],
        [
            'menu_id' => 'settings', 'label' => 'Settings', 'icon' => 'settings',
            'allowed_roles' => json_encode(['Developer', 'Super Admin']), 'sort_order' => 160
        ]
    ];

    $stmt = $pdo->prepare(
        "INSERT INTO app_menus (menu_id, label, icon, allowed_roles, sort_order) VALUES (:menu_id, :label, :icon, :allowed_roles, :sort_order)"
    );

    foreach ($menus as $menu) {
        $stmt->execute($menu);
    }

    echo "<p style='color: green;'>✅ " . count($menus) . " menu default berhasil dimasukkan ke database.</p>";
    echo "<h2>SUKSES! Database menu sudah siap.</h2>";
    echo "<p style='color: red; font-weight: bold;'>Jangan lupa hapus file 'seed_menus.php' ini sekarang!</p>";

} catch (PDOException $e) {
    echo "<h3 style='color: red;'>Error Database: " . $e->getMessage() . "</h3>";
}
?>