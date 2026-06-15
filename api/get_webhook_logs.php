<?php
// api/get_webhook_logs.php - temporary log reader
header("Content-Type: text/plain");
$log_file = __DIR__ . '/webhook_log.txt';
if (file_exists($log_file)) {
    // Show last 5000 chars to get recent entries
    $content = file_get_contents($log_file);
    $len = strlen($content);
    if ($len > 5000) {
        echo "... (showing last 5000 of $len bytes)\n";
        echo substr($content, -5000);
    } else {
        echo $content;
    }
} else {
    echo "Log file not found.";
}
