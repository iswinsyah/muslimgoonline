<?php
// api/get_webhook_logs.php - temporary log reader
header("Content-Type: text/plain");
$log_file = __DIR__ . '/webhook_log.txt';
if (file_exists($log_file)) {
    $content = file_get_contents($log_file);
    $lines = explode("\n", $content);
    $total = count($lines);
    
    // Show last 50 lines
    $start = max(0, $total - 50);
    echo "Total lines: $total (showing last 50)\n";
    echo "=================================\n";
    for ($i = $start; $i < $total; $i++) {
        echo $lines[$i] . "\n";
    }
} else {
    echo "Log file not found.";
}
