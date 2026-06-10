<?php
// api/login.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Username dan password wajib diisi.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, developer_id, nama_user, username, password, email, no_whatsapp, role, status, is_first_login FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        if ($user['status'] !== 'Active') {
            http_response_code(403);
            echo json_encode(['message' => 'Akun Anda tidak aktif. Silakan hubungi administrator.']);
            exit;
        }

        unset($user['password']); // Jangan kirim hash password ke frontend
        $user['is_first_login'] = (bool)$user['is_first_login']; // Pastikan tipe data boolean
        echo json_encode(['message' => 'Login berhasil!', 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Username atau password salah.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Login Error: " . $e->getMessage());
    echo json_encode(['message' => 'Terjadi kesalahan pada server.']);
}
?>