<?php
// api/get_menus.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $stmt = $pdo->prepare("SELECT menu_id, label, icon, JSON_UNQUOTE(allowed_roles) as roles FROM app_menus ORDER BY sort_order ASC");
    $stmt->execute();
    $menus = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert roles string back to array
    foreach ($menus as &$menu) {
        $menu['roles'] = json_decode($menu['roles']);
    }

    echo json_encode($menus);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Gagal memuat data menu: ' . $e->getMessage()]);
}
?>