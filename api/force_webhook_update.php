<?php
header("Content-Type: application/json");

function callFonnte($url, $token, $fields = []) {
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $fields,
        CURLOPT_HTTPHEADER => array(
            "Authorization: " . $token
        ),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30
    ));
    $response = curl_exec($curl);
    curl_close($curl);
    return json_decode($response, true);
}

$vql_res = callFonnte('https://api.fonnte.com/update-device', 'wbrBrBFrxjFyVHR79xB1', [
    'name' => 'Tenant: VQ Land',
    'webhook' => 'https://crmprosyariah.online/api/whatsapp_webhook.php'
]);

echo json_encode([
    'vql_update_res' => $vql_res
], JSON_PRETTY_PRINT);
?>
