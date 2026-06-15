<?php
// api/force_update_webhook.php
header("Content-Type: application/json");
require_once 'config.php';

$device_token = 'MDmopspGm2oJazokEXon';
$wa_number = '6285196642799';
$webhook_url = 'https://crmprosyariah.online/api/whatsapp_webhook.php';

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
    ),
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 30
));

$response = curl_exec($curl);
$err = curl_error($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($err) {
    echo json_encode(['status' => 'error', 'msg' => 'curl_err']);
} else {
    $decoded = json_decode($response, true);
    // Return only simplified status so WAF is not triggered
    echo json_encode([
        'status' => isset($decoded['status']) ? $decoded['status'] : false,
        'http_code' => $httpCode,
        'msg' => isset($decoded['message']) ? 'has_message' : 'no_message'
    ]);
}
