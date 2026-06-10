<?php
// api/leads.php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

$action = $_GET['action'] ?? '';

if ($action === 'create') {
    // Handle Create Lead
    $user_id = $_POST['user_id'] ?? null;
    $name = $_POST['name'] ?? null;
    $nik = $_POST['nik'] ?? null;
    $phone = $_POST['phone'] ?? null; // Opsional
    $job = $_POST['job'] ?? null;
    $channel = $_POST['channel'] ?? null;
    $segment = $_POST['segment'] ?? null;

    if (!$user_id || !$name || !$nik) {
        http_response_code(400);
        echo json_encode(['message' => 'Nama dan NIK wajib diisi.']);
        exit;
    }

    try {
        // Ambil developer_id dari user
        $stmtUser = $pdo->prepare("SELECT developer_id FROM users WHERE id = ?");
        $stmtUser->execute([$user_id]);
        $user = $stmtUser->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['message' => 'User tidak ditemukan.']);
            exit;
        }

        $stmt = $pdo->prepare(
            "INSERT INTO leads (developer_id, owner_id, name, nik, phone, job, channel, segment, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW_LEAD')"
        );
        $stmt->execute([
            $user['developer_id'],
            $user_id,
            $name,
            $nik,
            $phone, // Bisa null/kosong
            $job,
            $channel,
            $segment
        ]);

        echo json_encode(['message' => 'Lead berhasil ditambahkan!']);

    } catch (PDOException $e) {
        http_response_code(500);
        error_log("Create Lead Error: " . $e->getMessage());
        echo json_encode(['message' => 'Gagal menyimpan lead.']);
    }

} elseif ($action === 'update_status') {
    // Handle Update Status
    $id = $_POST['id'] ?? null;
    $status = $_POST['status'] ?? null;

    if (!$id || !$status) {
        http_response_code(400);
        echo json_encode(['message' => 'ID dan Status wajib diisi.']);
        exit;
    }

    try {
        $is_locked = ($status === 'SURVEY') ? 1 : 0;
        $stmt = $pdo->prepare("UPDATE leads SET status = ?, is_locked = ? WHERE id = ?");
        $stmt->execute([$status, $is_locked, $id]);
        echo json_encode(['message' => 'Status berhasil diperbarui.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Gagal update status.']);
    }
} elseif ($action === 'update_data') {
    // Handle Update Data Lead (Edit)
    $id = $_POST['id'] ?? null;
    $name = $_POST['name'] ?? null;
    $nik = $_POST['nik'] ?? null;
    $phone = $_POST['phone'] ?? null;
    $job = $_POST['job'] ?? null;
    $channel = $_POST['channel'] ?? null;
    $segment = $_POST['segment'] ?? null;

    if (!$id || !$name || !$nik) {
        http_response_code(400);
        echo json_encode(['message' => 'ID, Nama, dan NIK wajib diisi.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE leads SET name = ?, nik = ?, phone = ?, job = ?, channel = ?, segment = ? WHERE id = ?");
        $stmt->execute([$name, $nik, $phone, $job, $channel, $segment, $id]);
        echo json_encode(['message' => 'Data lead berhasil diperbarui.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Gagal update data lead.']);
    }
}
?>