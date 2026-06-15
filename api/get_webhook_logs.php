<?php
// api/get_webhook_logs.php
header("Content-Type: text/plain");
$log_file = __DIR__ . '/webhook_log.txt';
if (file_exists($log_file)) {
    echo file_get_contents($log_file);
} else {
    echo "Log file not found at " . $log_file;
}
