<?php
// api/cleanup_dummy.php
// PENTING: HAPUS FILE INI SETELAH SELESAI DIGUNAKAN!

require_once 'db_connect_pdo.php';

try {
    $pdo->beginTransaction();

    // 1. Hapus semua tugas (Tasks)
    $pdo->exec("DELETE FROM tasks");
    $pdo->exec("ALTER TABLE tasks AUTO_INCREMENT = 1");

    // 2. Hapus semua prospek (Leads)
    $pdo->exec("DELETE FROM leads");
    $pdo->exec("ALTER TABLE leads AUTO_INCREMENT = 1");

    // 3. Hapus semua User KECUALI Super Admin (agar Bos tidak terkunci keluar)
    $pdo->exec("DELETE FROM users WHERE role != 'Super Admin'");
    $pdo->exec("ALTER TABLE users AUTO_INCREMENT = 1");

    // 4. Hapus semua Tenant (Developers)
    $pdo->exec("DELETE FROM developers");
    $pdo->exec("ALTER TABLE developers AUTO_INCREMENT = 1");

    $pdo->commit();

    echo "<h1>🚀 Pembersihan Sukses!</h1>";
    echo "<p>Semua data dummy (Leads, Tasks, Users, Developers) telah dihapus.</p>";
    echo "<p>Akun <strong>Super Admin</strong> tetap aman di database.</p>";
    echo "<p style='color:red;'><strong>Segera hapus file ini dari server demi keamanan!</strong></p>";

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "<h1>❌ Gagal Membersihkan Data</h1>";
    echo "Error: " . $e->getMessage();
}
?>