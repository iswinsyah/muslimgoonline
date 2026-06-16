<?php
// api/set_key.php
header("Content-Type: text/plain");

if (!isset($_GET['token']) || $_GET['token'] !== 'aman_bos_123') {
    http_response_code(403);
    echo "Akses ditolak.";
    exit;
}

$new_key = $_GET['key'] ?? '';
if (empty($new_key)) {
    http_response_code(400);
    echo "Key kosong.";
    exit;
}

$config_file = __DIR__ . '/config.php';
if (!file_exists($config_file)) {
    // Jika file config.php tidak ada (karena terhapus), buat baru dari template config.example.php
    $template_file = __DIR__ . '/config.example.php';
    if (file_exists($template_file)) {
        copy($template_file, $config_file);
    } else {
        http_response_code(500);
        echo "Template config.example.php tidak ditemukan.";
        exit;
    }
}

$content = file_get_contents($config_file);
// Ganti nilai define('GEMINI_API_KEY', '...');
$content = preg_replace(
    "/define\('GEMINI_API_KEY',\s*'.*'\);/",
    "define('GEMINI_API_KEY', '$new_key');",
    $content
);

if (file_put_contents($config_file, $content) !== false) {
    echo "Sukses mengupdate API Key di server Hostinger!\n";
    echo "Model yang digunakan saat ini: gemini-2.5-flash\n";
} else {
    http_response_code(500);
    echo "Gagal menulis ke config.php.";
}
?>
