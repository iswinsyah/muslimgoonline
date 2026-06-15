<?php
// api/check_fonnte_status.php
header("Content-Type: text/plain");
require_once 'db_connect_pdo.php';
require_once 'config.php';

if (!defined('FONNTE_ACCOUNT_TOKEN') || empty(FONNTE_ACCOUNT_TOKEN)) {
    echo "ERROR: FONNTE_ACCOUNT_TOKEN is not defined\n";
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
    echo "ERROR: cURL error: " . $err . "\n";
    exit;
}

$devices = json_decode($response, true);

if (isset($devices['status']) && $devices['status'] === true) {
    echo "CONNECTED DEVICES COUNT: " . ($devices['connected'] ?? 0) . "\n\n";
    foreach ($devices['data'] as $d) {
        echo "Device: " . $d['device'] . "\n";
        echo "  Name: " . ($d['name'] ?? 'N/A') . "\n";
        echo "  Status: " . ($d['status'] ?? 'N/A') . "\n";
        echo "  Autoread: " . ($d['autoread'] ?? 'N/A') . "\n";
        echo "  Personal: " . ($d['personal'] ?? 'N/A') . "\n";
        echo "  Group: " . ($d['group'] ?? 'N/A') . "\n";
        echo "  Webhook: " . ($d['webhook'] ?? 'N/A') . "\n";
        echo "  Expired: " . ($d['expired-date'] ?? 'N/A') . "\n";
        echo "  Token (masked): " . (isset($d['token']) ? substr($d['token'], 0, 6) . "..." : 'N/A') . "\n";
        echo "---------------------------------\n";
    }
} else {
    echo "Fonnte status: false. Message: " . ($devices['message'] ?? 'N/A') . "\n";
}

echo "\nDEVELOPERS IN DB:\n";
$stmt = $pdo->query("SELECT id, nama_perusahaan, wa_number, fonnte_token FROM developers");
$db_developers = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($db_developers as $dev) {
    echo "ID: " . $dev['id'] . "\n";
    echo "  Company: " . $dev['nama_perusahaan'] . "\n";
    echo "  WA Number: " . $dev['wa_number'] . "\n";
    echo "  Token (masked): " . ($dev['fonnte_token'] ? substr($dev['fonnte_token'], 0, 6) . "..." : 'N/A') . "\n";
    echo "---------------------------------\n";
}
