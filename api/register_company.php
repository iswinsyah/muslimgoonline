<?php
// api/register_company.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'db_connect_pdo.php';

try {
    // --- Validasi Input ---
    $required_fields = ['nama_user', 'nama_perusahaan', 'alamat_perusahaan', 'kontak_perusahaan', 'username', 'password'];
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            http_response_code(400);
            echo json_encode(["message" => "Semua field wajib diisi."]);
            exit;
        }
    }

    if (!isset($_FILES['bukti_pembayaran']) || $_FILES['bukti_pembayaran']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["message" => "Upload bukti pembayaran wajib."]);
        exit;
    }

    $username = trim($_POST['username']);

    // --- Cek Username Duplikat ---
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmtCheck->execute([$username]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(["message" => "Username sudah digunakan, silakan pilih yang lain."]);
        exit;
    }

    // --- Handle File Upload ---
    $upload_dir = '../uploads/proofs/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    $file_extension = pathinfo($_FILES['bukti_pembayaran']['name'], PATHINFO_EXTENSION);
    $unique_filename = uniqid('proof_', true) . '.' . $file_extension;
    $upload_path = $upload_dir . $unique_filename;

    if (!move_uploaded_file($_FILES['bukti_pembayaran']['tmp_name'], $upload_path)) {
        throw new Exception("Gagal memindahkan file upload.");
    }
    $db_path = 'uploads/proofs/' . $unique_filename; // Path yang disimpan di DB

    // --- Mulai Transaksi Database ---
    $pdo->beginTransaction();

    // 1. Insert Perusahaan Baru dengan status 'Pending'
    $stmtDev = $pdo->prepare(
        "INSERT INTO developers (nama_perusahaan, alamat, kontak, status_langganan, bukti_pembayaran) VALUES (?, ?, ?, 'Pending', ?)"
    );
    $stmtDev->execute([
        trim($_POST['nama_perusahaan']),
        trim($_POST['alamat_perusahaan']),
        trim($_POST['kontak_perusahaan']),
        $db_path
    ]);
    $new_developer_id = $pdo->lastInsertId();

    // 2. Insert Akun Owner dengan status 'Pending'
    $passwordHash = password_hash(trim($_POST['password']), PASSWORD_DEFAULT);
    $stmtUser = $pdo->prepare(
        "INSERT INTO users (developer_id, nama_user, role, username, password, status) VALUES (?, ?, 'Developer', ?, ?, 'Pending')"
    );
    $stmtUser->execute([
        $new_developer_id,
        trim($_POST['nama_user']),
        $username,
        $passwordHash
    ]);

    // --- Selesaikan Transaksi ---
    $pdo->commit();

    echo json_encode(["message" => "Registrasi perusahaan berhasil! Akun Anda akan segera divalidasi oleh Super Admin dalam 1x24 jam."]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log("Company Registration Error: " . $e->getMessage());
    echo json_encode(["message" => "Terjadi kesalahan pada server: " . $e->getMessage()]);
}
?>