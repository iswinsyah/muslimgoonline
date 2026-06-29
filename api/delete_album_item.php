<?php
// api/delete_album_item.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';

// Data dikirim sebagai JSON raw atau POST biasa
$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$developer_id = $data['developer_id'] ?? null;
$user_id = $data['user_id'] ?? null;
$file_url = $data['file_url'] ?? null;

if (!$developer_id || !$user_id || !$file_url) {
    http_response_code(400);
    echo json_encode(['message' => 'Parameter tidak lengkap.']);
    exit;
}

// Validasi user (hanya Developer atau Super Admin yang bisa hapus)
$stmtUser = $pdo->prepare("SELECT role, developer_id FROM users WHERE id = ?");
$stmtUser->execute([$user_id]);
$user = $stmtUser->fetch();

if (!$user || !in_array($user['role'], ['Super Admin', 'Developer']) || ($user['role'] === 'Developer' && $user['developer_id'] != $developer_id)) {
    http_response_code(403);
    echo json_encode(['message' => 'Akses ditolak. Anda tidak berhak menghapus berkas ini.']);
    exit;
}

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
    
    // Cari dan buang file_url dari array
    $index = array_search($file_url, $album);
    if ($index !== false) {
        unset($album[$index]);
        $album = array_values($album); // Re-index array
        
        // Hapus file fisik dari server jika ada
        $physical_path = '..' . $file_url;
        if (file_exists($physical_path)) {
            unlink($physical_path);
        }
        
        // Simpan kembali ke DB
        $updated_album_json = json_encode($album);
        $stmtUpdate = $pdo->prepare("UPDATE developers SET property_album = ? WHERE id = ?");
        $stmtUpdate->execute([$updated_album_json, $developer_id]);
        
        echo json_encode([
            'message' => 'Berkas berhasil dihapus dari album!',
            'album' => $album
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Berkas tidak ditemukan dalam album.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Gagal menghapus berkas: ' . $e->getMessage()]);
}
?>
