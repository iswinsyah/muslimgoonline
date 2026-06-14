<?php
// api/get_developers.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect_pdo.php';

try {
    // Ambil semua developer untuk manajemen portfolio Super Admin
    $stmt = $pdo->query("SELECT id, nama_perusahaan, status_langganan, wa_number, fonnte_token, created_at FROM developers ORDER BY id DESC");
    $developers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($developers);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Gagal mengambil data developer: " . $e->getMessage()]);
}
?>