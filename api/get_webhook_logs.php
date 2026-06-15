<?php
header("Content-Type: text/plain");
$log_file = __DIR__ . '/webhook_log.txt';
if (!file_exists($log_file)) { echo "Not found"; exit; }
$content = file_get_contents($log_file);
$entries = preg_split('/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \|)/', $content);
echo "Total:" . count($entries) . "\n";
foreach ($entries as $e) {
    $e = trim($e);
    if (empty($e)) continue;
    // Show entries after 16:00 or containing error/failed/Gemini
    $isRecent = preg_match('/^2026-06-15 1[6-9]:/', $e);
    $isError = stripos($e, 'error') !== false || stripos($e, 'failed') !== false || stripos($e, 'Gemini API') !== false;
    if ($isRecent || $isError) {
        echo substr($e, 0, 150) . "\n---\n";
    }
}
