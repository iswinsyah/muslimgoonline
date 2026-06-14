<?php
// scratch_test_gemini.php
require_once 'api/config.php';

$prompt = "Siapakah Anda?";
echo "Testing GAS URL: " . GEMINI_GAS_URL . "\n";
echo "Prompt: $prompt\n\n";

$payload = ["prompt" => $prompt];

$ch = curl_init(GEMINI_GAS_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Apps Script redirect support
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "cURL Error: " . $curlError . "\n";
} else {
    echo "HTTP Status Code: " . $httpCode . "\n";
    echo "Raw Response: " . $response . "\n\n";
    
    $decoded = json_decode($response, true);
    if (isset($decoded['candidates'][0]['content']['parts'][0]['text'])) {
        echo "Parsed Text Response: \n" . $decoded['candidates'][0]['content']['parts'][0]['text'] . "\n";
    } else {
        echo "Failed to parse text from response structure.\n";
    }
}
?>
