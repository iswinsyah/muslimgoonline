<?php
// api/debug_mismatch.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';
require_once 'config.php';

try {
    // 1. Ambil data Bumi Berkah (atau tenant terbaru)
    $stmt = $pdo->query("SELECT id, nama_perusahaan, wa_number, fonnte_token, status_langganan FROM developers ORDER BY id DESC LIMIT 1");
    $db_dev = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Ambil data semua device dari Fonnte
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.fonnte.com/get-devices',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => array(
            "Authorization: " . FONNTE_ACCOUNT_TOKEN
        ),
    ));
    $fonnte_response = curl_exec($curl);
    curl_close($curl);
    $fonnte_data = json_decode($fonnte_response, true);

    echo json_encode([
        'db_tenant' => $db_dev,
        'fonnte_devices' => $fonnte_data
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
