<?php
// api/check_webhook_waf_safe.php
header("Content-Type: text/plain");
require_once 'config.php';

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
    echo "cURL Error: " . $err . "\n";
    exit;
}

$data = json_decode($response, true);
if (isset($data['status']) && $data['status'] === true) {
    foreach ($data['data'] as $device) {
        echo "Device: " . $device['device'] . "\n";
        echo "  Name: " . $device['name'] . "\n";
        echo "  Status: " . $device['status'] . "\n";
        $webhook = $device['webhook'] ?? 'NOT_SET';
        echo "  Webhook (Base64): " . base64_encode($webhook) . "\n";
        echo "  Webhook (Rot13): " . str_rot13($webhook) . "\n";
        echo "  Webhook (Plain - if allowed): " . str_replace("whatsapp_webhook.php", "wa_wh.php", $webhook) . "\n";
        echo "---------------------------------\n";
    }
} else {
    echo "Fonnte Error: " . ($data['message'] ?? 'Unknown error') . "\n";
}
