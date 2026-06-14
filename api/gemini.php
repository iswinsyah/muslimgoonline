<?php
require_once 'config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$data = json_decode(file_get_contents("php://input"), true);
$prompt = $data['prompt'] ?? '';

if (empty($prompt)) {
    http_response_code(400);
    echo json_encode(["error" => "Prompt is required"]);
    exit;
}

if (!defined('GEMINI_GAS_URL') || empty(GEMINI_GAS_URL)) {
    http_response_code(500);
    echo json_encode(["error" => "GAS URL belum disetting di server."]);
    exit;
}

$payload = [
    "prompt" => $prompt
];

$ch = curl_init(GEMINI_GAS_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); // Waktu tunggu koneksi (detik)
curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Total waktu eksekusi (detik)
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Apps Script redirect support
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(["error" => "cURL Error: " . $curlError]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code(500); 
    $errorDetails = json_decode($response, true);
    $specificMessage = $errorDetails['error']['message'] ?? "GAS API Error ($httpCode): " . $response;
    echo json_encode(["error" => $specificMessage]);
    exit;
}

$decoded = json_decode($response, true);
$text = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? "Maaf, AI tidak memberikan respons yang dapat dibaca.";

echo json_encode(["result" => $text]);