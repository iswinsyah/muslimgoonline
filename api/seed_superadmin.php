<?php
// api/seed_superadmin.php
// PENTING: HAPUS FILE INI SETELAH SELESAI DIGUNAKAN!

require_once 'db_connect_pdo.php';

try {
    $username = 'admin';
    $password_mentah = 'Khilafet@1924'; // Password yang Bos gunakan
    $password_hash = password_hash($password_mentah, PASSWORD_DEFAULT);
    
    // Cek apakah user admin sudah ada
    $check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $check->execute([$username]);
    
    if ($check->fetch()) {
        die("User Super Admin sudah ada di database.");
    }

    $stmt = $pdo->prepare("INSERT INTO users (nama_user, role, username, password, email, status, is_first_login) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        'Super Admin MGO',
        'Super Admin',
        $username,
        $password_hash,
        'admin@crmprosyariah.online',
        'Active',
        0
    ]);

    echo "<h1>✅ Super Admin Berhasil Dibuat!</h1>";
    echo "<p>Username: <strong>$username</strong></p>";
    echo "<p>Password: <strong>$password_mentah</strong></p>";
    echo "<p style='color:red;'><strong>Segera hapus file ini dari server demi keamanan!</strong></p>";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>