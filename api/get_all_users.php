<?php
// api/get_all_users.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once 'db_connect_pdo.php';

// Di aplikasi nyata, tambahkan validasi untuk memastikan hanya Super Admin yang bisa mengakses

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