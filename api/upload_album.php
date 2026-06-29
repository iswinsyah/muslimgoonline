<?php
// api/upload_album.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';

$developer_id = $_POST['developer_id'] ?? null;
$user_id = $_POST['user_id'] ?? null;
$upload_file = $_FILES['file'] ?? null;

if (!$developer_id || !$user_id || !$upload_file) {
    http_response_code(400);
    echo json_encode(['message' => 'Parameter tidak lengkap.']);
    exit;
}

// Validasi user (hanya Developer atau Super Admin yang bisa upload)
$stmtUser = $pdo->prepare("SELECT role, developer_id FROM users WHERE id = ?");
$stmtUser->execute([$user_id]);
$user = $stmtUser->fetch();

if (!$user || !in_array($user['role'], ['Super Admin', 'Developer']) || ($user['role'] === 'Developer' && $user['developer_id'] != $developer_id)) {
    http_response_code(403);
    echo json_encode(['message' => 'Akses ditolak. Anda tidak berhak mengunggah ke album ini.']);
    exit;
}

// Validasi upload
if ($upload_file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['message' => 'Terjadi kesalahan saat mengunggah berkas.']);
    exit;
}

// Validasi ekstensi (hanya foto / video singkat)
$file_extension = strtolower(pathinfo($upload_file['name'], PATHINFO_EXTENSION));
$allowed_extensions = ['jpg', 'jpeg', 'png', 'webp', 'mp4'];
if (!in_array($file_extension, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(['message' => 'Format berkas tidak diizinkan. Hanya JPG, PNG, WEBP, dan MP4.']);
    exit;
}

// Buat direktori jika belum ada
$upload_dir = '../uploads/album/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$safe_filename = "album_" . $developer_id . "_" . time() . "_" . uniqid() . "." . $file_extension;
$upload_path = $upload_dir . $safe_filename;
$relative_url = '/uploads/album/' . $safe_filename;

if (move_uploaded_file($upload_file['tmp_name'], $upload_path)) {
    try {
        // Ambil data album lama
        $stmtDev = $pdo->prepare("SELECT property_album FROM developers WHERE id = ?");
        $stmtDev->execute([$developer_id]);
        $dev = $stmtDev->fetch();
        
        $album = [];
        if ($dev && !empty($dev['property_album'])) {
            $album = json_decode($dev['property_album'], true);
            if (!is_array($album)) {
                $album = [];
            }
        }
        
        // Tambahkan item baru ke array
        $album[] = $relative_url;
        $updated_album_json = json_encode($album);
        
        // Simpan kembali ke DB
        $stmtUpdate = $pdo->prepare("UPDATE developers SET property_album = ? WHERE id = ?");
        $stmtUpdate->execute([$updated_album_json, $developer_id]);
        
        echo json_encode([
            'message' => 'Berkas berhasil ditambahkan ke album!',
            'file_url' => $relative_url,
            'album' => $album
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Gagal memperbarui album di database: ' . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Gagal menyimpan berkas di server.']);
}
?>
