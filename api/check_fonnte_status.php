<?php
// api/check_fonnte_status.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';
require_once 'config.php';

if (!defined('FONNTE_ACCOUNT_TOKEN') || empty(FONNTE_ACCOUNT_TOKEN)) {
    echo json_encode(['error' => 'FONNTE_ACCOUNT_TOKEN is not defined']);
    exit;
}

$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://api.fonnte.com/get-devices',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => array(
        "Authorization: " . FONNTE_ACCOUNT_TOKEN
    )
));

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo json_encode(['error' => 'cURL error: ' . $err]);
    exit;
}

$devices = json_decode($response, true);

// Fetch developer list from DB to match
$stmt = $pdo->query("SELECT id, nama_perusahaan, wa_number, fonnte_token FROM developers");
$db_developers = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'fonnte_response' => $devices,
    'db_developers' => $db_developers
], JSON_PRETTY_PRINT);
