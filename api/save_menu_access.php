<?php
// api/save_menu_access.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);

// --- Validasi Super Admin ---
$user_id = $data['user_id'] ?? null;
$menu_data = $data['menus'] ?? null;

if (!$user_id || !$menu_data) {
    http_response_code(400);
    echo json_encode(['message' => 'Input tidak valid.']);
    exit;
}

$stmtUser = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmtUser->execute([$user_id]);
$user = $stmtUser->fetch();

if (!$user || !in_array($user['role'], ['Super Admin', 'Developer'])) {
    http_response_code(403);
    echo json_encode(['message' => 'Akses ditolak. Hanya Super Admin atau Developer yang dapat mengubah hak akses.']);
    exit;
}
// --- End Validasi ---

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("UPDATE app_menus SET allowed_roles = ? WHERE menu_id = ?");

    foreach ($menu_data as $menu) {
        $stmt->execute([json_encode($menu['roles']), $menu['menu_id']]);
    }

    $pdo->commit();
    echo json_encode(['message' => 'Hak akses menu berhasil diperbarui! Perubahan akan aktif setelah user login ulang.']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log("Save Menu Access Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal menyimpan perubahan: ' . $e->getMessage()]);
}
?>