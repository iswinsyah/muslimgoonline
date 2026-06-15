<?php
// api/read_webhook_log.php
header("Content-Type: text/plain");
$log_file = 'webhook_log.txt';
if (file_exists($log_file)) {
    echo file_get_contents($log_file);
} else {
    echo "Log file not found. Webhook has not been triggered yet.";
}
?>
