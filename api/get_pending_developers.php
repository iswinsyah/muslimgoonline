<?php
// api/get_pending_developers.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once 'db_connect_pdo.php';

// Di aplikasi nyata, tambahkan validasi untuk memastikan hanya Super Admin yang bisa mengakses
/*
session_start();
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'Super Admin') {
    http_response_code(403);
    echo json_encode(['message' => 'Akses ditolak.']);
    exit;
}
*/

try {
    $stmt = $pdo->query("
        SELECT 
            d.id, 
            d.nama_perusahaan, 
            d.alamat, 
            d.kontak, 
            d.bukti_pembayaran, 
            d.created_at,
            u.nama_user AS nama_pemilik,
            u.username AS username_pemilik
        FROM developers d
        JOIN users u ON d.id = u.developer_id AND u.role = 'Developer'
        WHERE d.status_langganan = 'Pending'
        ORDER BY d.created_at ASC
    ");
    $pending_developers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($pending_developers);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Get Pending Devs Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal mengambil data pendaftar.']);
}
?>