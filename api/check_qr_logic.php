<?php
// api/check_qr_logic.php
header("Content-Type: text/plain");
require_once 'db_connect_pdo.php';
require_once 'config.php';

$developer_id = 3; // VQ Land
$wa_number = '6285196642799';

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
    $err = curl_error($curl);
    curl_close($curl);
    if ($err) {
        return ['status' => false, 'reason' => 'cURL Error: ' . $err];
    }
    return json_decode($response, true);
}

function formatTo62($number) {
    $number = preg_replace('/\D/', '', $number);
    if (strpos($number, '0') === 0) {
        $number = '62' . substr($number, 1);
    }
    return $number;
}

echo "Step 1: Fetching list of devices from Fonnte...\n";
$listResponse = callFonnte('https://api.fonnte.com/get-devices', FONNTE_ACCOUNT_TOKEN);
echo "Raw listResponse type: " . gettype($listResponse) . "\n";
echo "Keys in listResponse: " . implode(', ', array_keys($listResponse)) . "\n";

$device_token = null;
if (isset($listResponse['data']) && is_array($listResponse['data'])) {
    echo "Found " . count($listResponse['data']) . " devices in Fonnte data.\n";
    foreach ($listResponse['data'] as $devItem) {
        $formatted_dev = formatTo62($devItem['device']);
        $formatted_wa = formatTo62($wa_number);
        echo "Comparing Fonnte device '{$formatted_dev}' with DB wa_number '{$formatted_wa}'\n";
        if ($formatted_dev === $formatted_wa) {
            echo "MATCH FOUND! Token: " . substr($devItem['token'], 0, 5) . "...\n";
            $device_token = $devItem['token'];
            break;
        }
    }
} else {
    echo "listResponse['data'] is NOT set or NOT an array!\n";
}

if (!$device_token) {
    echo "No matching device token found. Logic would proceed to add-device.\n";
} else {
    echo "Matching device token found: " . substr($device_token, 0, 5) . "...\n";
}
