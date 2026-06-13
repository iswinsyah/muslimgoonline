<?php
// api/add_token_to_pool.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

// Di aplikasi nyata, tambahkan cek session Super Admin di sini

$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'] ?? null;
$wa_number = $data['wa_number'] ?? null;

if (!$token || !$wa_number) {
    http_response_code(400);
    echo json_encode(['message' => 'Token dan Nomor WA wajib diisi.']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO fonnte_tokens_pool (token, wa_number, status) VALUES (?, ?, 'Available')");
    $stmt->execute([$token, $wa_number]);

    echo json_encode(['message' => 'Token baru berhasil ditambahkan ke gudang stok AI.']);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['message' => 'Token ini sudah ada di dalam gudang.']);
    } else {
        http_response_code(500);
        error_log("Add Token Pool Error: " . $e->getMessage());
        echo json_encode(['message' => 'Gagal menyimpan token ke gudang.']);
    }
}
?>