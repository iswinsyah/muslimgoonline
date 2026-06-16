<?php
require_once 'config.php';
header("Content-Type: text/plain");
echo "Local API Key in config: " . substr(GEMINI_API_KEY, 0, 8) . "..." . substr(GEMINI_API_KEY, -5) . "\n";
echo "Key Length: " . strlen(GEMINI_API_KEY) . "\n";
?>
