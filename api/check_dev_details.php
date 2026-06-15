<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';
try {
    $devs = $pdo->query("SELECT id, nama_perusahaan, wa_number, status_langganan, fonnte_token FROM developers")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($devs, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
