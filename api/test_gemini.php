<?php
require_once 'config.php';
header("Content-Type: text/plain");

$apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';
echo "Testing API Key on Server: " . substr($apiKey, 0, 8) . "..." . substr($apiKey, -5) . "\n";

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

$payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => "Katakan Halo"]
            ]
        ]
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "cURL Error: " . $curlError . "\n";
} else {
    echo "HTTP Status Code: " . $httpCode . "\n";
    echo "Response:\n" . $response . "\n";
}
?>
