<?php
// api/disconnect_whatsapp.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'db_connect_pdo.php';

$data = json_decode(file_get_contents("php://input"), true);
$developer_id = $data['developer_id'] ?? null;

if (!$developer_id) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'ID Developer wajib diisi.']);
    exit;
}

try {
    // 1. Ambil token device lama untuk proses disconnect di Fonnte
    $stmtGet = $pdo->prepare("SELECT fonnte_token FROM developers WHERE id = ?");
    $stmtGet->execute([$developer_id]);
    $dev = $stmtGet->fetch(PDO::FETCH_ASSOC);
    $device_token = $dev['fonnte_token'] ?? null;

    if (!empty($device_token)) {
        // Panggil API Fonnte untuk disconnect (logout) sesi WA
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://api.fonnte.com/disconnect',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => array(
                "Authorization: " . $device_token
            ),
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30
        ));
        curl_exec($curl);
        curl_close($curl);
    }

    // 2. Kosongkan token & nomor WA di database
    $stmt = $pdo->prepare("UPDATE developers SET fonnte_token = NULL, wa_number = NULL WHERE id = ?");
    $stmt->execute([$developer_id]);

    echo json_encode([
        'status' => true,
        'message' => 'Koneksi WhatsApp berhasil diputuskan dari sistem.'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
