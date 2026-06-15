<?php
// api/test_update_device.php
header("Content-Type: text/plain");
require_once 'db_connect_pdo.php';
require_once 'config.php';

$stmt = $pdo->prepare("SELECT id, nama_perusahaan, wa_number, fonnte_token FROM developers WHERE nama_perusahaan LIKE ?");
$stmt->execute(['%VQ Land%']);
$dev = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$dev) {
    echo "ERROR: Developer VQ Land not found in DB\n";
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

echo "DEVELOPER:\n";
print_r($dev);
echo "\nFIELDS SENT:\n";
print_r($fields);
echo "\nCURL ERROR: " . $err . "\n";
echo "\nFONNTE RESPONSE:\n" . $response . "\n";
