<?php
// api/list_fonnte_devices_debug.php
header("Content-Type: application/json");
require_once 'config.php';

$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://api.fonnte.com/get-devices',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => array(
        "Authorization: " . FONNTE_ACCOUNT_TOKEN
    ),
));
$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo json_encode(['error' => $err]);
} else {
    echo $response;
}
?>
