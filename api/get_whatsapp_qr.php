<?php
// api/get_whatsapp_qr.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'db_connect_pdo.php';
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$developer_id = $data['developer_id'] ?? null;
$wa_input = $data['wa_number'] ?? null;

if (!$developer_id || !$wa_input) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'ID Developer dan Nomor WhatsApp wajib diisi.']);
    exit;
}

// 1. Validasi Fonnte Account Token
if (!defined('FONNTE_ACCOUNT_TOKEN') || empty(FONNTE_ACCOUNT_TOKEN) || FONNTE_ACCOUNT_TOKEN === 'PASTE_TOKEN_AKUN_FONNTE_DISINI') {
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => 'Fonnte Account Token utama belum dikonfigurasi oleh Super Admin di server.']);
    exit;
}

// 2. Normalisasi nomor WhatsApp
$wa_number = preg_replace('/\D/', '', $wa_input);
if (strpos($wa_number, '0') === 0) {
    $wa_number = '62' . substr($wa_number, 1);
}

if (strlen($wa_number) < 8 || strlen($wa_number) > 15) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'Nomor WhatsApp tidak valid. Panjang nomor harus 8-15 digit.']);
    exit;
}

try {
    // 3. Ambil data Developer (Company)
    $stmtDev = $pdo->prepare("SELECT nama_perusahaan, company_slug FROM developers WHERE id = ?");
    $stmtDev->execute([$developer_id]);
    $developer = $stmtDev->fetch(PDO::FETCH_ASSOC);

    if (!$developer) {
        http_response_code(404);
        echo json_encode(['status' => false, 'message' => 'Tenant tidak ditemukan.']);
        exit;
    }

    $company_name = $developer['nama_perusahaan'];
    $device_token = null;

    // Helper function untuk memanggil Fonnte API via POST (Multipart/Form-Data)
    function callFonnte($url, $token, $fields = []) {
        $curl = curl_init();
        
        // Fonnte API memerlukan form-data, jadi kita kirim array fields langsung
        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $fields,
            CURLOPT_HTTPHEADER => array(
                "Authorization: " . $token
            ),
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30
        ));
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);
        
        if ($err) {
            return ['status' => false, 'reason' => 'cURL Error: ' . $err];
        }
        
        return json_decode($response, true);
    }

    function formatTo62($number) {
        $number = preg_replace('/\D/', '', $number);
        if (strpos($number, '0') === 0) {
            $number = '62' . substr($number, 1);
        }
        return $number;
    }

    // 4. Periksa apakah nomor tersebut sudah terdaftar di daftar device Fonnte
    $listResponse = callFonnte('https://api.fonnte.com/get-devices', FONNTE_ACCOUNT_TOKEN);
    
    if (isset($listResponse['status']) && $listResponse['status'] === true && !empty($listResponse['data'])) {
        foreach ($listResponse['data'] as $devItem) {
            if (formatTo62($devItem['device']) === formatTo62($wa_number)) {
                // Device sudah terdaftar di Fonnte, gunakan token yang ada
                $device_token = $devItem['token'];
                break;
            }
        }
    }

    // 5. Jika belum terdaftar di Fonnte, tambahkan device baru
    if (!$device_token) {
        $addResponse = callFonnte('https://api.fonnte.com/add-device', FONNTE_ACCOUNT_TOKEN, [
            'name' => 'Tenant: ' . substr($company_name, 0, 20),
            'device' => $wa_number,
            'autoread' => 'true',
            'personal' => 'true',
            'group' => 'false'
        ]);

        if (isset($addResponse['status']) && $addResponse['status'] === true && !empty($addResponse['token'])) {
            $device_token = $addResponse['token'];
        } else {
            $reason = $addResponse['reason'] ?? ($addResponse['message'] ?? 'Alasan tidak diketahui');
            http_response_code(400);
            echo json_encode([
                'status' => false, 
                'message' => 'Gagal mendaftarkan device ke Fonnte: ' . $reason . '. Silakan hubungi Super Admin untuk kuota device.'
            ]);
            exit;
        }
    }

    // 6. Simpan token device & wa_number ke database tenant
    $stmtUpdate = $pdo->prepare("UPDATE developers SET fonnte_token = ?, wa_number = ? WHERE id = ?");
    $stmtUpdate->execute([$device_token, $wa_number, $developer_id]);

    // 7. Perbarui URL Webhook untuk device ini agar mengarah ke server kita
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'];
    $webhook_url = $protocol . $host . "/api/whatsapp_webhook.php";
    
    // Panggil update-device menggunakan Device Token
    callFonnte('https://api.fonnte.com/update-device', $device_token, [
        'name' => 'Tenant: ' . substr($company_name, 0, 20),
        'webhook' => $webhook_url
    ]);

    // 8. Dapatkan QR Code koneksi menggunakan Device Token
    $qrResponse = callFonnte('https://api.fonnte.com/qr', $device_token, [
        'type' => 'qr'
    ]);

    if (isset($qrResponse['status']) && $qrResponse['status'] === true && !empty($qrResponse['url'])) {
        $qr_image = $qrResponse['url'];
        if (strpos($qr_image, 'data:image') !== 0) {
            $qr_image = 'data:image/png;base64,' . $qr_image;
        }
        echo json_encode([
            'status' => true,
            'qr' => $qr_image,
            'wa_number' => $wa_number,
            'message' => 'Silakan scan QR code untuk menghubungkan WhatsApp.'
        ]);
    } else {
        $reason = $qrResponse['reason'] ?? 'Gagal membuat QR Code dari Fonnte. Pastikan nomor WhatsApp tidak sedang terhubung.';
        $reason_lower = strtolower($reason);
        if (strpos($reason_lower, 'free device already connected') !== false) {
            http_response_code(400);
            echo json_encode([
                'status' => false,
                'message' => 'Batas maksimal perangkat WhatsApp gratis di Fonnte telah tercapai (hanya 1 perangkat terhubung yang diperbolehkan). Silakan hubungi Super Admin untuk menonaktifkan perangkat lain.'
            ]);
        } elseif (strpos($reason_lower, 'already connected') !== false) {
            echo json_encode([
                'status' => true,
                'already_connected' => true,
                'wa_number' => $wa_number,
                'message' => 'WhatsApp Anda sudah terhubung sebelumnya.'
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'status' => false,
                'message' => $reason
            ]);
        }
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
