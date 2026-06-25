<?php
// api/update_developer_status.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

require_once 'db_connect_pdo.php';

// Di aplikasi nyata, tambahkan validasi untuk memastikan hanya Super Admin yang bisa mengakses

$data = json_decode(file_get_contents("php://input"), true);
$developer_id = $data['developer_id'] ?? null;
$new_status = $data['status'] ?? null; // 'Active' or 'Rejected'
$fonnte_token = $data['fonnte_token'] ?? null;
$wa_number = $data['wa_number'] ?? null;

if (!$developer_id || !in_array($new_status, ['Active', 'Inactive', 'Pending', 'Rejected'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Input tidak valid.']);
    exit;
}

// Fungsi untuk menghitung tanggal jatuh tempo berikutnya yang selalu jatuh pada tanggal 30
function getNext30thDate($currentDueStr = null) {
    $today = new DateTime('today');
    
    if ($currentDueStr) {
        $currentDue = new DateTime($currentDueStr);
        if ($currentDue >= $today) {
            $nextDue = clone $currentDue;
            $nextDue->modify('+1 month');
            $year = $nextDue->format('Y');
            $month = $nextDue->format('m');
            $day = ($month == '02') ? (date('L', mktime(0,0,0,1,1,$year)) ? '29' : '28') : '30';
            return "$year-$month-$day";
        }
    }
    
    $year = $today->format('Y');
    $month = $today->format('m');
    $dayOfToday = (int)$today->format('d');
    
    if ($dayOfToday < 25) {
        $day = ($month == '02') ? (date('L', mktime(0,0,0,1,1,$year)) ? '29' : '28') : '30';
        return "$year-$month-$day";
    } else {
        $today->modify('+1 month');
        $year = $today->format('Y');
        $month = $today->format('m');
        $day = ($month == '02') ? (date('L', mktime(0,0,0,1,1,$year)) ? '29' : '28') : '30';
        return "$year-$month-$day";
    }
}

try {
    $pdo->beginTransaction();

    // --- AI PROVISIONING AGENT LOGIC ---
    // Ambil data developer lama untuk melihat apakah sudah ada token/nomor WA
    $stmtGetDev = $pdo->prepare("SELECT fonnte_token, wa_number FROM developers WHERE id = ?");
    $stmtGetDev->execute([$developer_id]);
    $existingDev = $stmtGetDev->fetch();

    if ($new_status === 'Active') {
        // Prioritaskan nilai wa_number & token yang sudah ada di database developer (jika ada)
        if ($existingDev) {
            if (!empty($existingDev['wa_number'])) {
                $wa_number = $existingDev['wa_number'];
            }
            if (empty($fonnte_token) && !empty($existingDev['fonnte_token'])) {
                $fonnte_token = $existingDev['fonnte_token'];
            }
        }

        // Jika token masih kosong (baik di DB maupun input admin kosong), baru cari di Pool
        if (empty($fonnte_token)) {
            $stmtPool = $pdo->prepare("SELECT id, token, wa_number FROM fonnte_tokens_pool WHERE status = 'Available' LIMIT 1");
            $stmtPool->execute();
            $poolItem = $stmtPool->fetch();

            if ($poolItem) {
                $fonnte_token = $poolItem['token'];
                // Gunakan wa_number dari pool jika di DB juga kosong
                if (empty($wa_number)) {
                    $wa_number = $poolItem['wa_number'];
                }
                
                // Tandai token di gudang sudah terpakai
                $stmtUpdatePool = $pdo->prepare("UPDATE fonnte_tokens_pool SET status = 'Used', assigned_to_developer_id = ? WHERE id = ?");
                $stmtUpdatePool->execute([$developer_id, $poolItem['id']]);
            }
        }
    }

    // 1. Update status di tabel developers
    if ($new_status === 'Active') {
        $stmtCheckDue = $pdo->prepare("SELECT billing_due_date FROM developers WHERE id = ?");
        $stmtCheckDue->execute([$developer_id]);
        $devRow = $stmtCheckDue->fetch();
        $billing_due_date = $devRow['billing_due_date'] ?? null;
        if (empty($billing_due_date)) {
            $billing_due_date = getNext30thDate();
        }
        $stmtDev = $pdo->prepare("UPDATE developers SET status_langganan = ?, fonnte_token = ?, wa_number = ?, billing_due_date = ? WHERE id = ?");
        $stmtDev->execute([$new_status, $fonnte_token, $wa_number, $billing_due_date, $developer_id]);
    } else {
        $stmtDev = $pdo->prepare("UPDATE developers SET status_langganan = ?, fonnte_token = ?, wa_number = ? WHERE id = ?");
        $stmtDev->execute([$new_status, $fonnte_token, $wa_number, $developer_id]);
    }

    // 2. Update status di tabel users untuk owner-nya
    $user_status = 'Inactive';
    if ($new_status === 'Active') {
        $user_status = 'Active';
    } elseif ($new_status === 'Rejected') {
        $user_status = 'Rejected';
    }
    $stmtUser = $pdo->prepare("UPDATE users SET status = ? WHERE developer_id = ? AND role = 'Developer'");
    $stmtUser->execute([$user_status, $developer_id]);

    $pdo->commit();

    // Kirim notifikasi email ke developer (opsional, tapi sangat direkomendasikan)
    // mail($developer_email, "Status Pendaftaran Anda", "Pendaftaran Anda telah di-{$new_status}.");

    echo json_encode(['message' => "Pendaftaran perusahaan telah berhasil di-{$new_status}."]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log("Update Dev Status Error: " . $e->getMessage());
    echo json_encode(['message' => 'Gagal memperbarui status pendaftar: ' . $e->getMessage()]);
}
?>