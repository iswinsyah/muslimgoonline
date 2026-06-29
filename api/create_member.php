<?php
// api/create_member.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['username']) || empty($data['password']) || empty($data['developer_id']) || empty($data['role'])) {
    http_response_code(400);
    echo json_encode(["message" => "Data pendaftaran tim tidak lengkap."]);
    exit;
}

try {
    // Cek apakah username sudah ada
    $check = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $check->execute([$data['username']]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(["message" => "Username sudah digunakan oleh orang lain."]);
        exit;
    }

    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
    $no_whatsapp = isset($data['no_whatsapp']) ? formatWhatsAppNumber($data['no_whatsapp']) : null;
    
    $stmt = $pdo->prepare("INSERT INTO users (developer_id, nama_user, username, password, no_whatsapp, role, status, is_first_login) VALUES (?, ?, ?, ?, ?, ?, 'Active', 0)");
    $stmt->execute([
        $data['developer_id'],
        $data['nama_user'],
        $data['username'],
        $hashed_password,
        $no_whatsapp,
        $data['role']
    ]);
    
    echo json_encode(["message" => "Anggota tim berhasil didaftarkan."]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Create Member Error: " . $e->getMessage());
    echo json_encode(["message" => "Gagal menyimpan data ke server."]);
}
?>