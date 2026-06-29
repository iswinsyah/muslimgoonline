<?php
// api/save_learning.php
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$lead_id = $data['lead_id'] ?? null;
$buyer_job = $data['buyer_job'] ?? 'Unknown';
$property_segment = $data['property_segment'] ?? 'Unknown';
$objections = $data['objections'] ?? '';
$successful_tactics = $data['successful_tactics'] ?? '';
$chat_snippet = $data['chat_snippet'] ?? '';

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['message' => 'User ID wajib diisi.']);
    exit;
}

try {
    // Ambil developer_id dari users
    $stmtUser = $pdo->prepare("SELECT developer_id FROM users WHERE id = ?");
    $stmtUser->execute([$user_id]);
    $user = $stmtUser->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'User tidak ditemukan.']);
        exit;
    }
    
    $developer_id = $user['developer_id'];

    // Jika objections/tactics dikirim sebagai array, convert ke string/list
    if (is_array($objections)) {
        $objections = implode("\n", $objections);
    }
    if (is_array($successful_tactics)) {
        $successful_tactics = implode("\n", $successful_tactics);
    }

    $stmt = $pdo->prepare("
        INSERT INTO sales_learnings (developer_id, lead_id, buyer_job, property_segment, objections, successful_tactics, chat_snippet)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $developer_id,
        $lead_id,
        $buyer_job,
        $property_segment,
        $objections,
        $successful_tactics,
        $chat_snippet
    ]);

    echo json_encode(['status' => true, 'message' => 'Pembelajaran taktik sukses berhasil disimpan ke AI Brain!']);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Save Learning Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal menyimpan data pembelajaran: ' . $e->getMessage()]);
}
?>
