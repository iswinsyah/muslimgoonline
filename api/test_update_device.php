<?php
// api/test_update_device.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';
require_once 'config.php';

// We want to test updating device for VQ Land (which has WA number 6285196642799 or similar)
$stmt = $pdo->prepare("SELECT id, nama_perusahaan, wa_number, fonnte_token FROM developers WHERE nama_perusahaan LIKE ?");
$stmt->execute(['%VQ Land%']);
$dev = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$dev) {
    echo json_encode(['error' => 'Developer VQ Land not found in DB']);
    exit;
}

$device_token = $dev['fonnte_token'];
$wa_number = $dev['wa_number'];
$webhook_url = "https://crmprosyariah.online/api/whatsapp_webhook.php";

$fields = [
    'device' => $wa_number,
    'name' => 'Tenant: VQ Land',
    'webhook' => $webhook_url,
    'autoread' => 'true',
    'personal' => 'true',
    'group' => 'false'
];

$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://api.fonnte.com/update-device',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $fields,
    CURLOPT_HTTPHEADER => array(
        "Authorization: " . $device_token
    )
));

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

echo json_encode([
    'developer' => $dev,
    'fields_sent' => $fields,
    'curl_error' => $err,
    'fonnte_response' => json_decode($response, true) ?? $response
], JSON_PRETTY_PRINT);
