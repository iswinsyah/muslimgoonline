<?php
// api/db_connect_pdo.php
// Koneksi Database menggunakan PDO (PHP Data Objects) untuk keamanan maksimal

$host = 'localhost';
$db   = 'u759889304_crmpro';
$user = 'u759889304_admin';
$pass = 'Khilafet@1924';     // Sesuai Password yang dibuat di Hostinger Baru
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Di production, jangan echo error detail ke publik
    http_response_code(500);
    echo json_encode(["error" => "Koneksi Database Gagal"]);
    exit;
}
?>