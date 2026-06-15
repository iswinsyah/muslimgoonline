<?php
// api/test_gas.php
header("Content-Type: text/plain");
require_once 'config.php';

$key = GEMINI_API_KEY;
$url = GEMINI_GAS_URL;

function testGAS($url, $payload) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => $response,
        'err' => $err
    ];
}

echo "1. Testing standard payload (no key):\n";
print_r(testGAS($url, ["prompt" => "Hello, who are you?"]));

echo "\n2. Testing with key in body:\n";
print_r(testGAS($url, ["prompt" => "Hello, who are you?", "key" => $key]));

echo "\n3. Testing with apiKey in body:\n";
print_r(testGAS($url, ["prompt" => "Hello, who are you?", "apiKey" => $key]));

echo "\n4. Testing with gemini_key in body:\n";
print_r(testGAS($url, ["prompt" => "Hello, who are you?", "gemini_key" => $key]));

echo "\n5. Testing with key in query param:\n";
print_r(testGAS($url . "?key=" . urlencode($key), ["prompt" => "Hello, who are you?"]));

echo "\n6. Testing with apiKey in query param:\n";
print_r(testGAS($url . "?apiKey=" . urlencode($key), ["prompt" => "Hello, who are you?"]));
