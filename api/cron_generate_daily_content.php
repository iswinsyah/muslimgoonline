<?php
// api/cron_generate_daily_content.php
// Script ini dijalankan otomatis oleh Cron Job Server setiap hari pukul 05:00 WIB

require_once 'db_connect_pdo.php';
require_once 'config.php';

header("Content-Type: application/json");

// Helper untuk memanggil Gemini AI
function generateAIContent($prompt, $developer_id = null, $pdo = null) {
    $apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';
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
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
    curl_setopt($ch, CURLOPT_TIMEOUT, 40);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("Gemini API Error ($httpCode): " . $response);
    }
    
    $decoded = json_decode($response, true);
    $text = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
    if (!$text) {
        throw new Exception("Gemini returned empty response.");
    }
    
    // Catat pemakaian token
    $usage = $decoded['usageMetadata'] ?? null;
    if ($usage && $developer_id && $pdo) {
        try {
            $stmtLog = $pdo->prepare("INSERT INTO usage_logs (developer_id, feature, gemini_prompt_tokens, gemini_completion_tokens, gemini_total_tokens) VALUES (?, ?, ?, ?, ?)");
            $stmtLog->execute([
                $developer_id,
                'Cron Daily Content',
                $usage['promptTokenCount'] ?? 0,
                $usage['candidatesTokenCount'] ?? 0,
                $usage['totalTokenCount'] ?? 0
            ]);
        } catch (Exception $e) {
            // Abaikan log error agar cron tetap lanjut
        }
    }
    
    return $text;
}

try {
    // Ambil semua developer yang aktif
    $stmtDevs = $pdo->query("SELECT id, nama_perusahaan, ai_persona_insight, ai_content_calendar, calendar_started_at FROM developers WHERE status_langganan = 'Active'");
    $developers = $stmtDevs->fetchAll();

    $processed = [];
    $todayDate = date('Y-m-d');

    foreach ($developers as $dev) {
        $devId = $dev['id'];
        
        // 1. Cek jika kalender konten kosong
        if (empty($dev['ai_content_calendar'])) {
            $processed[] = ['developer' => $dev['nama_perusahaan'], 'status' => 'Skipped (No Calendar)'];
            continue;
        }

        // 2. Tentukan tanggal mulai kalender
        $startedAt = $dev['calendar_started_at'];
        if (empty($startedAt)) {
            // Jika kosong, set hari ini sebagai tanggal mulai pertama kali
            $startedAt = date('Y-m-d H:i:s');
            $stmtSetStart = $pdo->prepare("UPDATE developers SET calendar_started_at = ? WHERE id = ?");
            $stmtSetStart->execute([$startedAt, $devId]);
        }

        // 3. Hitung indeks Hari ke-N
        $diffSeconds = time() - strtotime($startedAt);
        $dayIndex = floor($diffSeconds / 86400) + 1;

        // 4. Cari item kalender untuk hari N
        $calendar = json_decode($dev['ai_content_calendar'], true);
        if (!is_array($calendar)) {
            $processed[] = ['developer' => $dev['nama_perusahaan'], 'status' => 'Skipped (Invalid Calendar JSON)'];
            continue;
        }

        $targetItem = null;
        foreach ($calendar as $item) {
            if (isset($item['day']) && (int)$item['day'] === (int)$dayIndex) {
                $targetItem = $item;
                break;
            }
        }

        // Jika melebihi durasi kalender, loop kembali ke Hari ke-1 (atau batasi)
        if (!$targetItem && count($calendar) > 0) {
            // Modulus untuk perulangan siklus kalender
            $maxDays = count($calendar);
            $loopedIndex = (($dayIndex - 1) % $maxDays) + 1;
            foreach ($calendar as $item) {
                if (isset($item['day']) && (int)$item['day'] === (int)$loopedIndex) {
                    $targetItem = $item;
                    $dayIndex = $loopedIndex; // Sesuaikan indeks hari
                    break;
                }
            }
        }

        if (!$targetItem) {
            $processed[] = ['developer' => $dev['nama_perusahaan'], 'status' => "Skipped (No item for Day $dayIndex)"];
            continue;
        }

        // 5. Picu AI Gemini untuk merancang AI Social Media Kit
        $persona = $dev['ai_persona_insight'] ?? 'Target market umum properti syariah';
        $topic = $targetItem['topic_idea'] ?? 'Keunggulan perumahan syariah tanpa sita';
        $pillar = $targetItem['content_pillar'] ?? 'Edukasi';
        $format = $targetItem['format'] ?? 'Carousel';

        $prompt = `Anda adalah seorang Creative Copywriter dan Social Media Planner ahli untuk perumahan syariah.
        
**KONTEKS BUYER PERSONA:**
---
${persona}
---

**TUGAS ANDA:**
Susunlah sebuah **AI Social Media Kit** terpadu untuk topik konten hari ini:
- **Topik:** "${topic}"
- **Pilar:** "${pillar}"
- **Rekomendasi Format Awal:** "${format}"

**INSTRUKSI OUTPUT (WAJIB JSON TUNGGAL YANG BISA DI-PARSE):**
Kembalikan output hanya berupa data JSON terstruktur sebagai berikut:
{
  "hook_title": "Judul Hook Viral yang menarik minat dalam 3 detik pertama",
  "carousel_slides": [
    {
      "slide_number": 1,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 1",
      "text_overlay": "Teks singkat pembuka di slide 1"
    },
    {
      "slide_number": 2,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 2",
      "text_overlay": "Poin masalah atau fakta di slide 2"
    },
    {
      "slide_number": 3,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 3",
      "text_overlay": "Poin agitasi/pendalaman masalah di slide 3"
    },
    {
      "slide_number": 4,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 4",
      "text_overlay": "Solusi syariah yang ditawarkan di slide 4"
    },
    {
      "slide_number": 5,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 5",
      "text_overlay": "Keunggulan detail unit produk di slide 5"
    },
    {
      "slide_number": 6,
      "visual_concept": "Deskripsi konsep visual gambar untuk slide 6",
      "text_overlay": "Ajakan bertindak (CTA) & info kontak di slide 6"
    }
  ],
  "video_prompt": "Prompt detail dalam bahasa Inggris untuk generator video AI (seperti Google Veo atau Runway Gen-2) agar merender video pendek unit rumah syariah aesthetic sesuai topik ini",
  "voice_over_script": "Naskah narasi suara (Voice-Over) santai, persuasif berdurasi 15-30 detik untuk dibacakan oleh pengisi suara video",
  "caption": "Copywriting teks Caption promosi lengkap dan rapi untuk diunggah di feed sosial media",
  "hashtags": {
    "instagram": "#propertisyariah #rumahminimalis #kprsyariah #instagramhashtags",
    "facebook": "#propertisyariah #rumahsyariah #facebookhashtags",
    "tiktok": "#propertisyariah #rumahminimalis #tiktokhashtags #fyp",
    "shorts": "#shorts #propertisyariah #youtubeshorts"
  }
}

Pastikan output hanya string JSON murni tanpa pembungkus markdown seperti \`\`\`json.`;

        try {
            $aiResponse = generateAIContent($prompt, $devId, $pdo);
            $cleanResponse = trim(preg_replace('/```json|```/', '', $aiResponse));
            
            // Validasi JSON parseable
            $parsedKit = json_decode($cleanResponse, true);
            if (!is_array($parsedKit)) {
                throw new Exception("Response AI bukan format JSON yang valid.");
            }

            // Susun data konten hari ini
            $todaysContent = [
                'date' => $todayDate,
                'day_index' => $dayIndex,
                'topic' => $topic,
                'format' => $format,
                'kit' => $parsedKit
            ];

            // Simpan ke database
            $stmtUpdate = $pdo->prepare("UPDATE developers SET ai_todays_content = ? WHERE id = ?");
            $stmtUpdate->execute([json_encode($todaysContent), $devId]);

            $processed[] = [
                'developer' => $dev['nama_perusahaan'],
                'status' => 'Success',
                'day_index' => $dayIndex,
                'topic' => $topic
            ];
        } catch (Exception $e) {
            $processed[] = [
                'developer' => $dev['nama_perusahaan'],
                'status' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'date' => $todayDate,
        'results' => $processed
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
