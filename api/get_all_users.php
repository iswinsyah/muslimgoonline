<?php
// api/get_all_users.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once 'db_connect_pdo.php';

// Validasi untuk memastikan hanya Super Admin yang bisa mengakses
$admin_id = $_GET['admin_id'] ?? null;

if (!$admin_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Admin ID wajib disediakan.']);
    exit;
}

$stmtUser = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmtUser->execute([$admin_id]);
$user = $stmtUser->fetch();

if (!$user || $user['role'] !== 'Super Admin') {
    http_response_code(403);
    echo json_encode(['message' => 'Akses ditolak. Hanya Super Admin yang dapat mengakses data ini.']);
    exit;
}

try {
    $stmt = $pdo->query("
        SELECT 
            u.id, 
            u.nama_user, 
            u.username, 
            u.role,
            d.nama_perusahaan
        FROM users u
        LEFT JOIN developers d ON u.developer_id = d.id
        WHERE u.role != 'Super Admin'
        ORDER BY d.nama_perusahaan, u.nama_user ASC
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get All Users Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal mengambil data pengguna.']);
}
?>