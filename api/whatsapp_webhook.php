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

if (!$sender || !$message || !$device) {
    // Abaikan jika data tidak lengkap
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
        exit;
    }

    if (empty($tenant['fonnte_token'])) {
        // Jika tenant belum punya token, sistem tidak bisa membalas
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
    $ai_answer = callGeminiAI($prompt);

    // 4. Balas ke WhatsApp menggunakan API Fonnte
    sendToFonnte($sender, $ai_answer, $tenant['fonnte_token']);

} catch (Exception $e) {
    error_log("WA Webhook Error: " . $e->getMessage());
}

function callGeminiAI($prompt) {
    if (!defined('GEMINI_GAS_URL') || empty(GEMINI_GAS_URL)) {
        return "Maaf, saat ini layanan asisten otomatis kami sedang dalam pemeliharaan. Mohon tinggalkan pesan, admin kami akan segera menghubungi Anda.";
    }

    $payload = ["prompt" => $prompt];
    
    $ch = curl_init(GEMINI_GAS_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Apps Script redirect support
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        return "Maaf, saat ini layanan asisten otomatis kami sedang dalam pemeliharaan. Mohon tinggalkan pesan, admin kami akan segera menghubungi Anda.";
    }
    
    $decoded = json_decode($response, true);
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