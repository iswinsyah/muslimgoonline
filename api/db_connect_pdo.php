<?php
// api/db_connect_pdo.php
// Koneksi Database menggunakan PDO (PHP Data Objects) untuk keamanan maksimal

$host = 'localhost';
$db   = 'u829486010_crmprosyar';
$user = 'u829486010_crmprosyar';
$pass = 'Khilafet@1924';
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
    echo json_encode(["error" => "Koneksi Database Gagal: " . $e->getMessage()]);
    exit;
}

if (!function_exists('formatWhatsAppNumber')) {
    function formatWhatsAppNumber($phone) {
        if (empty($phone)) return null;
        
        // Hapus karakter non-digit kecuali tanda plus
        $phone = preg_replace('/[^\d+]/', '', $phone);
        
        $hasCountryCode = false;
        // Bersihkan awalan plus (+) atau double zero (00)
        if (strpos($phone, '+') === 0) {
            $phone = substr($phone, 1);
            $hasCountryCode = true;
        } elseif (strpos($phone, '00') === 0) {
            $phone = substr($phone, 2);
            $hasCountryCode = true;
        }
        
        // Jika sudah ada kode negara eksplisit dari awal (via + atau 00), jangan ubah apa-apa
        if ($hasCountryCode) {
            return $phone;
        }
        
        // Jika diawali 08 (HP Indonesia), ubah ke 628
        if (strpos($phone, '08') === 0) {
            $phone = '62' . substr($phone, 1);
        }
        // Jika diawali 62 (Kode negara Indonesia), biarkan saja
        elseif (strpos($phone, '62') === 0) {
            // Biarkan saja
        }
        // Jika diawali 852 (Hong Kong) dengan panjang tepat 11 digit, biarkan sebagai nomor HK
        elseif (strpos($phone, '852') === 0 && strlen($phone) === 11) {
            // Biarkan saja
        }
        // Jika diawali 8 (misal 812... yang hilang angka 0 didepannya), ubah ke 628
        elseif (preg_match('/^8[1-9]/', $phone)) {
            $phone = '62' . $phone;
        }
        // Jika diawali 0 selain 08, hilangkan 0 nya
        elseif (strpos($phone, '0') === 0) {
            $phone = substr($phone, 1);
        }
        
        return $phone;
    }
}
?>