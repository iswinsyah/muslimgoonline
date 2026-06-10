<?php
// api/seed_users.php
// Script untuk mengisi data dummy Developer dan User

require_once 'db_connect_pdo.php';

try {
    // 1. Bersihkan Data Lama (Opsional, hati-hati di production!)
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("TRUNCATE TABLE users");
    $pdo->exec("TRUNCATE TABLE developers");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Insert Developers (Tenant)
    $pdo->exec("INSERT INTO developers (id, nama_perusahaan, status_langganan) VALUES 
        (1, 'MGO Properti Pusat', 'Active'),
        (2, 'Amanah Residence', 'Active'),
        (3, 'Berkah Syariah Land', 'Active')
    ");

    // 3. Insert Users dengan Role Berbeda
    // Password default: '123456' (di-hash)
    $passwordHash = password_hash('123456', PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (id, developer_id, nama_user, role, username, password) VALUES 
        -- SUPER ADMIN (Milik MGO Pusat, bisa lihat semua)
        (1, 1, 'Bos Besar MGO', 'Super Admin', 'superadmin', '$passwordHash'),
        
        -- DEVELOPER (Boss Amanah Residence, hanya lihat data Amanah)
        (2, 2, 'Pak Haji Amanah', 'Developer', 'dev_amanah', '$passwordHash'),
        
        -- ADMIN CS (Karyawan Amanah, handle data sendiri + input)
        (3, 2, 'Mbak CS Amanah', 'Admin CS', 'cs_amanah', '$passwordHash'),
        
        -- AGENT FREELANCE (Sales Amanah, handle data sendiri)
        (4, 2, 'Mas Sales Amanah', 'Agent Freelance', 'agent_amanah', '$passwordHash'),

        -- DEVELOPER LAIN (Boss Berkah, untuk tes isolasi data)
        (5, 3, 'Pak Ustadz Berkah', 'Developer', 'dev_berkah', '$passwordHash')
    ";

    $pdo->exec($sql);

    echo "<h1>Data Dummy Berhasil Dibuat!</h1>";
    echo "<p>Silakan login dengan username berikut (Password semua: <strong>123456</strong>):</p>";
    echo "<ul>
            <li><strong>superadmin</strong> (Super Admin)</li>
            <li><strong>dev_amanah</strong> (Developer - Amanah Residence)</li>
            <li><strong>cs_amanah</strong> (Admin CS - Amanah Residence)</li>
            <li><strong>agent_amanah</strong> (Agent - Amanah Residence)</li>
            <li><strong>dev_berkah</strong> (Developer - Berkah Syariah)</li>
          </ul>";

} catch (PDOException $e) {
    die("Gagal Seed Data: " . $e->getMessage());
}
?>