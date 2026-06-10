<?php
// api/signup.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-control-Allow-Methods: POST");

require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);

// --- Validasi Input ---
$nama_user = trim($data['nama_user'] ?? '');
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');
$email = trim($data['email'] ?? '');
$no_whatsapp = trim($data['no_whatsapp'] ?? '');
$role = trim($data['role'] ?? '');

if (empty($nama_user) || empty($username) || empty($password) || empty($email) || empty($no_whatsapp) || empty($role)) {
    http_response_code(400);
    echo json_encode(["message" => "Semua field wajib diisi."]);
    exit;
}

try {
    // --- Cek Username Duplikat ---
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmtCheck->execute([$username]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(["message" => "Username '$username' sudah digunakan, silakan pilih yang lain."]);
        exit;
    }
    
    // --- Cek Email Duplikat ---
    $stmtCheckEmail = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmtCheckEmail->execute([$email]);
    if ($stmtCheckEmail->fetch()) {
        http_response_code(409);
        echo json_encode(["message" => "Email '$email' sudah terdaftar, silakan gunakan email lain."]);
        exit;
    }

    $pdo->beginTransaction();

    $developer_id = null;

    // --- Logika untuk Role Developer ---
    if ($role === 'Developer') {
        $nama_perusahaan = trim($data['nama_perusahaan'] ?? '');
        if (empty($nama_perusahaan)) {
            throw new Exception("Nama perusahaan baru wajib diisi untuk role Developer.");
        }

        // --- Generate and check for unique slug ---
        $baseSlug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $nama_perusahaan), '-'));
        $slug = $baseSlug;
        $counter = 1;
        $stmtSlug = $pdo->prepare("SELECT id FROM developers WHERE company_slug = ?");
        $stmtSlug->execute([$slug]);
        while ($stmtSlug->fetch()) {
            $slug = $baseSlug . '-' . $counter++;
            $stmtSlug->execute([$slug]);
        }
        // --- End slug generation ---

        // Insert perusahaan baru dengan status 'Active' dan kontak dari no whatsapp
        $stmtDev = $pdo->prepare(
            "INSERT INTO developers (nama_perusahaan, company_slug, kontak, status_langganan) VALUES (?, ?, ?, 'Active')"
        );
        $stmtDev->execute([$nama_perusahaan, $slug, $no_whatsapp]);
        $developer_id = $pdo->lastInsertId();
    } else {
        // --- Logika untuk Role Lain ---
        $developer_id = $data['developer_id'] ?? null;
        if (empty($developer_id)) {
            throw new Exception("Perusahaan wajib dipilih untuk role ini.");
        }
    }

    // --- Insert User Baru ---
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmtUser = $pdo->prepare(
        "INSERT INTO users (developer_id, nama_user, username, password, email, no_whatsapp, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')"
    );
    $stmtUser->execute([
        $developer_id,
        $nama_user,
        $username,
        $passwordHash,
        $email,
        $no_whatsapp,
        $role
    ]);

    $pdo->commit();

    echo json_encode(["message" => "Pendaftaran berhasil! Silakan login dengan akun baru Anda."]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log("Signup Error: " . $e->getMessage());
    echo json_encode(["message" => "Terjadi kesalahan: " . $e->getMessage()]);
}
?>