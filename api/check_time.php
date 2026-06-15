<?php
// api/check_time.php
header("Content-Type: text/plain");
echo "Server Time: " . date("Y-m-d H:i:s") . "\n";
$file = __DIR__ . '/check_webhook_status.php';
if (file_exists($file)) {
    echo "check_webhook_status.php modified: " . date("Y-m-d H:i:s", filemtime($file)) . "\n";
    echo "check_webhook_status.php size: " . filesize($file) . " bytes\n";
    echo "check_webhook_status.php content:\n";
    echo file_get_contents($file);
} else {
    echo "check_webhook_status.php does not exist\n";
}
