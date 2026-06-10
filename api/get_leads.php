<?php
// api/get_leads.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require_once 'db_connect_pdo.php';

if (!isset($_GET['user_id']) || empty($_GET['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Akses ditolak: Sesi tidak valid."]);
    exit;
}
$user_id = $_GET['user_id']; 

try {
    // 1. Validasi User & Ambil Info Tenant (Developer ID)
    // Kita cek ke DB: Siapa user ini? Dia kerja di perusahaan mana (developer_id)? Apa jabatannya (role)?
    $stmtUser = $pdo->prepare("SELECT id, developer_id, role FROM users WHERE id = ?");
    $stmtUser->execute([$user_id]);
    $currentUser = $stmtUser->fetch();

    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(["message" => "User tidak valid"]);
        exit;
    }

    $developer_id = $currentUser['developer_id'];
    $role = $currentUser['role'];

    // 2. LOGIKA ISOLASI DATA (MULTI-TENANT CORE)
    $sql = "";
    $params = [];

    if ($role === 'Super Admin') {
        // LEVEL 1: GOD MODE (Melihat SEMUA data dari SEMUA Perusahaan)
        // Berguna untuk Global Portfolio MGO Pusat
        $sql = "SELECT leads.*, developers.nama_perusahaan 
                FROM leads 
                JOIN developers ON leads.developer_id = developers.id 
                ORDER BY leads.created_at DESC";
    } 
    elseif ($role === 'Developer') {
        // LEVEL 2: COMPANY MODE (Melihat data SATU PERUSAHAAN saja)
        // Boss Developer bisa melihat kinerja semua sales-nya, tapi TIDAK BISA lihat data Developer lain.
        $sql = "SELECT * FROM leads WHERE developer_id = ? ORDER BY created_at DESC";
        $params[] = $developer_id;
    } 
    elseif ($role === 'Admin CS' || $role === 'Agent Freelance') {
        // LEVEL 3: PRIVATE MODE (Melihat data MILIK SENDIRI saja)
        // Sales hanya bisa melihat lead yang dia input/handle sendiri.
        $sql = "SELECT * FROM leads WHERE developer_id = ? AND owner_id = ? ORDER BY created_at DESC";
        $params[] = $developer_id;
        $params[] = $user_id;
    } 
    else {
        // Role tidak dikenal = Blokir akses
        echo json_encode([]);
        exit;
    }

    // 3. Eksekusi Query Aman (Prepared Statement)
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $leads = $stmt->fetchAll();

    // Format data tambahan untuk Frontend
    foreach ($leads as &$row) {
        $row['isLocked'] = (bool)$row['is_locked'];
    }

    echo json_encode($leads);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server Error: " . $e->getMessage()]);
}
?>