<?php
// api/get_developers.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect_pdo.php';

try {
    // Ambil semua developer yang statusnya aktif untuk ditampilkan di dropdown
    $stmt = $pdo->query("SELECT id, nama_perusahaan FROM developers WHERE status_langganan = 'Active' ORDER BY nama_perusahaan ASC");
    $developers = $stmt->fetchAll();

    echo json_encode($developers);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Gagal mengambil data developer: " . $e->getMessage()]);
}
?>