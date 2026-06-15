<?php
header("Content-Type: application/json");
require_once 'config.php';

function callFonnte($url, $token, $fields = []) {
    $curl = curl_init();
    
    $opts = array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => array(
            "Authorization: " . $token
        ),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30
    );

    if (!empty($fields)) {
        $opts[CURLOPT_POSTFIELDS] = $fields;
    }
    
    curl_setopt_array($curl, $opts);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    if ($err) {
        return ['status' => false, 'reason' => 'cURL Error: ' . $err];
    }
    
    return json_decode($response, true);
}

// Test dengan parameter kosong [] (seperti get_whatsapp_qr.php saat ini)
$curl_empty_fields = curl_init();
curl_setopt_array($curl_empty_fields, array(
    CURLOPT_URL => 'https://api.fonnte.com/get-devices',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => [],
    CURLOPT_HTTPHEADER => array(
        "Authorization: " . FONNTE_ACCOUNT_TOKEN
    ),
));
$res_empty = curl_exec($curl_empty_fields);
curl_close($curl_empty_fields);

// Test dengan no CURLOPT_POSTFIELDS
$res_no_fields = callFonnte('https://api.fonnte.com/get-devices', FONNTE_ACCOUNT_TOKEN);

echo json_encode([
    'res_empty_fields_raw' => $res_empty,
    'res_empty_fields_json' => json_decode($res_empty, true),
    'res_no_fields_json' => $res_no_fields
], JSON_PRETTY_PRINT);
?>
