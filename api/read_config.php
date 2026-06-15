<?php
// api/read_config.php
header("Content-Type: text/plain");
require_once 'config.php';

echo "GEMINI_API_KEY: " . GEMINI_API_KEY . "\n";
echo "GEMINI_GAS_URL: " . GEMINI_GAS_URL . "\n";
echo "FONNTE_ACCOUNT_TOKEN: " . FONNTE_ACCOUNT_TOKEN . "\n";
