<?php
// api/seed_civic.php
// Trigger redeploy: 3
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $username = 'civic';
    $password_mentah = '12345678';
    $password_hash = password_hash($password_mentah, PASSWORD_DEFAULT);
    
    // Cek apakah username sudah digunakan
    $check = $pdo->prepare("SELECT id, role FROM users WHERE username = ?");
    $check->execute([$username]);
    $existing = $check->fetch();
    
    if ($existing) {
        // Jika sudah ada, update password dan pastikan role-nya Super Admin
        $stmtUpdate = $pdo->prepare("UPDATE users SET password = ?, role = 'Super Admin', status = 'Active' WHERE id = ?");
        $stmtUpdate->execute([$password_hash, $existing['id']]);
        
        echo json_encode([
            "status" => "success",
            "message" => "User 'civic' sudah ada. Password dan role berhasil diperbarui menjadi Super Admin!"
        ]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO users (nama_user, role, username, password, email, status, is_first_login) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        'Civic Admin',
        'Super Admin',
        $username,
        $password_hash,
        'civic@crmprosyariah.online',
        'Active',
        0
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Super Admin 'civic' berhasil ditambahkan!"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal: " . $e->getMessage()
    ]);
}
?>
