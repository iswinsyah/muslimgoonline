<?php
// api/get_webhook_logs.php - temporary log reader (compact)
header("Content-Type: text/plain");
$log_file = __DIR__ . '/webhook_log.txt';
if (!file_exists($log_file)) { echo "Log not found."; exit; }

$content = file_get_contents($log_file);
// Split by date pattern to get individual entries
$entries = preg_split('/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \|)/', $content);
$total = count($entries);

echo "Total entries: $total\n";
echo "=================================\n";

// Show last 15 entries, truncate each to 200 chars
$start = max(0, $total - 15);
for ($i = $start; $i < $total; $i++) {
    $entry = trim($entries[$i]);
    if (empty($entry)) continue;
    // Truncate long entries
    if (strlen($entry) > 200) {
        $entry = substr($entry, 0, 200) . "...[TRUNCATED]";
    }
    echo $entry . "\n---\n";
}
