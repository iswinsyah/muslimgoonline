<?php
// api/whatsapp_webhook.php
// Webhook untuk integrasi Fonnte (WhatsApp Gateway) + Gemini AI
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';
require_once 'config.php';

// Ambil data yang dikirim oleh Fonnte via POST
$sender = $_POST['sender'] ?? null;   // Nomor pengirim (Calon Pembeli)
$message = $_POST['message'] ?? null; // Pesan yang dikirim
$device = $_POST['device'] ?? null;   // Nomor WA Tenant (penerima/device yang terdaftar)

// Cek jika data dikirim sebagai JSON
if (empty($_POST)) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if ($data) {
        $sender = $data['sender'] ?? null;
        $message = $data['message'] ?? null;
        $device = $data['device'] ?? null;
    }
}

// LOG INPUT UNTUK DEBUGGING
$raw_input = file_get_contents('php://input');
file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " | INCOMING -> Sender: $sender, Message: $message, Device: $device | POST: " . json_encode($_POST) . " | RAW: " . $raw_input . "\n", FILE_APPEND);

if (!$sender || !$message || !$device) {
    // Abaikan jika data tidak lengkap
    file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " | Ignored due to incomplete data.\n", FILE_APPEND);
    exit;
}

// Normalisasi nomor device (WhatsApp Penerima) ke format standard 62
$device = preg_replace('/\D/', '', $device);
if (strpos($device, '0') === 0) {
    $device = '62' . substr($device, 1);
}

try {
    // 1. Identifikasi Tenant (Developer) berdasarkan nomor device (WA mereka)
    $stmt = $pdo->prepare("SELECT id, nama_perusahaan, ai_cs_instruction, fonnte_token FROM developers WHERE wa_number = ?");
    $stmt->execute([$device]);
    $tenant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tenant) {
        // Jika nomor device tidak terdaftar di sistem kita, abaikan
        file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " | Tenant NOT FOUND in database for device: $device\n", FILE_APPEND);
        exit;
    }

    if (empty($tenant['fonnte_token'])) {
        // Jika tenant belum punya token, sistem tidak bisa membalas
        file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " | Tenant found (ID: {$tenant['id']}) but has EMPTY fonnte_token\n", FILE_APPEND);
        exit;
    }

    $instruction = $tenant['ai_cs_instruction'] ?: "Anda adalah Customer Service properti syariah yang ramah dan membantu.";
    $nama_perusahaan = $tenant['nama_perusahaan'];

    // 2. Bangun Prompt untuk Gemini AI
    $prompt = "Anda adalah AI Customer Service untuk perusahaan properti bernama '$nama_perusahaan'. 
Gunakan instruksi khusus berikut dalam melayani: 
$instruction

Pertanyaan Calon Pembeli: \"$message\"

Berikan jawaban yang singkat, padat, persuasif, dan sangat ramah. Jangan gunakan format markdown yang rumit (seperti bold berlebih atau tabel) karena pesan ini dikirim via WhatsApp.";

    // 3. Panggil API Gemini (Re-use logic dari gemini.php)
    $ai_answer = callGeminiAI($prompt, $tenant['id']);

    // 4. Balas ke WhatsApp menggunakan API Fonnte
    file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " | Sending reply -> Target: $sender, Reply: $ai_answer, Token: " . substr($tenant['fonnte_token'], 0, 5) . "...\n", FILE_APPEND);
    sendToFonnte($sender, $ai_answer, $tenant['fonnte_token']);

    // Catat pengiriman WhatsApp ke log
    try {
        $stmtLogWA = $pdo->prepare("INSERT INTO usage_logs (developer_id, feature, whatsapp_messages_sent) VALUES (?, 'CS Chatbot WA Send', 1)");
        $stmtLogWA->execute([$tenant['id']]);
    } catch (Exception $e) {
        error_log("Failed to log WA message sent: " . $e->getMessage());
    }

} catch (Exception $e) {
    file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " | ERROR occurred: " . $e->getMessage() . "\n", FILE_APPEND);
    error_log("WA Webhook Error: " . $e->getMessage());
}

function callGeminiAI($prompt, $developer_id) {
    $apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';
    if (empty($apiKey)) {
        return "Maaf, saat ini layanan asisten otomatis kami sedang dalam pemeliharaan. Mohon tinggalkan pesan, admin kami akan segera menghubungi Anda.";
    }

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;
    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ]
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    
    if ($httpCode !== 200 || $err) {
        file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " | Gemini API call failed -> HTTP: $httpCode, Error: $err, Response: $response\n", FILE_APPEND);
        return "Maaf, saat ini layanan asisten otomatis kami sedang dalam pemeliharaan. Mohon tinggalkan pesan, admin kami akan segera menghubungi Anda.";
    }
    
    $decoded = json_decode($response, true);
    
    // Catat pemakaian token Gemini jika ada metadata
    $usage = $decoded['usageMetadata'] ?? null;
    if ($usage && $developer_id) {
        try {
            global $pdo;
            $stmtLog = $pdo->prepare("INSERT INTO usage_logs (developer_id, feature, gemini_prompt_tokens, gemini_completion_tokens, gemini_total_tokens) VALUES (?, 'CS Chatbot AI Processing', ?, ?, ?)");
            $stmtLog->execute([
                $developer_id,
                $usage['promptTokenCount'] ?? 0,
                $usage['candidatesTokenCount'] ?? 0,
                $usage['totalTokenCount'] ?? 0
            ]);
        } catch (Exception $e) {
            error_log("Failed to log CS Chatbot Gemini usage: " . $e->getMessage());
        }
    }
    
    return $decoded['candidates'][0]['content']['parts'][0]['text'] ?? "Maaf, saat ini layanan asisten otomatis kami sedang dalam pemeliharaan. Mohon tinggalkan pesan, admin kami akan segera menghubungi Anda.";
}

function sendToFonnte($target, $msg, $token) {
    $data = ['target' => $target, 'message' => $msg];
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_HTTPHEADER, array("Authorization: $token"));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($curl, CURLOPT_URL, "https://api.fonnte.com/send");
    curl_exec($curl);
    curl_close($curl);
}