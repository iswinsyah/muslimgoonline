<?php
// api/check_whatsapp_status.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'db_connect_pdo.php';
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$developer_id = $data['developer_id'] ?? null;

if (!$developer_id) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'ID Developer wajib diisi.']);
    exit;
}

if (!defined('FONNTE_ACCOUNT_TOKEN') || empty(FONNTE_ACCOUNT_TOKEN) || FONNTE_ACCOUNT_TOKEN === 'PASTE_TOKEN_AKUN_FONNTE_DISINI') {
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => 'Fonnte Account Token utama belum dikonfigurasi oleh Super Admin di server.']);
    exit;
}

try {
    // Ambil wa_number dari database
    $stmt = $pdo->prepare("SELECT wa_number, fonnte_token FROM developers WHERE id = ?");
    $stmt->execute([$developer_id]);
    $dev = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$dev || empty($dev['wa_number'])) {
        echo json_encode([
            'status' => true,
            'device_status' => 'disconnect',
            'message' => 'WhatsApp belum dikonfigurasi.'
        ]);
        exit;
    }

    $wa_number = preg_replace('/\D/', '', $dev['wa_number']);

    // Panggil Fonnte API get-devices menggunakan Account Token
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.fonnte.com/get-devices',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => array(
            "Authorization: " . FONNTE_ACCOUNT_TOKEN
        ),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30
    ));
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal menghubungi Fonnte API: ' . $err]);
        exit;
    }

    $resData = json_decode($response, true);

    $device_status = 'disconnect';
    $found = false;

    if (isset($resData['status']) && $resData['status'] === true && !empty($resData['data'])) {
        foreach ($resData['data'] as $devItem) {
            $cleanedItemDev = preg_replace('/\D/', '', $devItem['device']);
            if ($cleanedItemDev === $wa_number) {
                $device_status = $devItem['status']; // 'connect' or 'disconnect'
                $found = true;
                break;
            }
        }
    }

    // Jika device tidak ditemukan di Fonnte sama sekali tapi ada di DB kita, statusnya disconnect
    echo json_encode([
        'status' => true,
        'device_status' => $device_status,
        'found_on_fonnte' => $found,
        'wa_number' => $wa_number
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
