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

try {
    $pdo->beginTransaction();

    // --- AI PROVISIONING AGENT LOGIC ---
    // Ambil data developer lama untuk melihat apakah sudah ada token
    $stmtGetDev = $pdo->prepare("SELECT fonnte_token, wa_number FROM developers WHERE id = ?");
    $stmtGetDev->execute([$developer_id]);
    $existingDev = $stmtGetDev->fetch();

    if ($new_status === 'Active') {
        if (empty($fonnte_token)) {
            // Jika di DB sudah ada token, pakai yang di DB
            if ($existingDev && !empty($existingDev['fonnte_token'])) {
                $fonnte_token = $existingDev['fonnte_token'];
                // Gunakan wa_number dari DB jika input wa_number kosong atau sama dengan kontak/nomor lama
                if (empty($wa_number) || $wa_number == $existingDev['wa_number']) {
                    $wa_number = $existingDev['wa_number'];
                }
            } else {
                // Jika DB kosong, baru cari di Pool
                $stmtPool = $pdo->prepare("SELECT id, token, wa_number FROM fonnte_tokens_pool WHERE status = 'Available' LIMIT 1");
                $stmtPool->execute();
                $poolItem = $stmtPool->fetch();

                if ($poolItem) {
                    $fonnte_token = $poolItem['token'];
                    $wa_number = $poolItem['wa_number'];
                    
                    // Tandai token di gudang sudah terpakai
                    $stmtUpdatePool = $pdo->prepare("UPDATE fonnte_tokens_pool SET status = 'Used', assigned_to_developer_id = ? WHERE id = ?");
                    $stmtUpdatePool->execute([$developer_id, $poolItem['id']]);
                }
            }
        }
    }

    // 1. Update status di tabel developers
    $stmtDev = $pdo->prepare("UPDATE developers SET status_langganan = ?, fonnte_token = ?, wa_number = ? WHERE id = ?");
    $stmtDev->execute([$new_status, $fonnte_token, $wa_number, $developer_id]);

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