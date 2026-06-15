<?php
// api/check_update_response.php
header("Content-Type: text/plain");
require_once 'config.php';

$device_token = 'MDmopspGm2oJazokEXon';
$wa_number = '6285196642799';
$webhook_url = 'https://crmprosyariah.online/api/whatsapp_webhook.php';

$fields = [
    'name' => 'Tenant: VQ Land',
    'webhook' => $webhook_url
];

$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://api.fonnte.com/update-device',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $fields,
    CURLOPT_HTTPHEADER => array(
        "Authorization: " . $device_token
    ),
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 30
));

$response = curl_exec($curl);
$err = curl_error($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($err) {
    echo "cURL Error: " . $err . "\n";
} else {
    echo "HTTP Code: " . $httpCode . "\n";
    echo "Raw response length: " . strlen($response) . "\n";
    echo "Base64 response: " . base64_encode($response) . "\n";
}
