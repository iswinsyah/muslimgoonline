<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    // 1. Alter column status_langganan di tabel developers
    $pdo->exec("ALTER TABLE developers MODIFY COLUMN status_langganan ENUM('Active', 'Inactive', 'Pending', 'Rejected') DEFAULT 'Pending'");
    
    // 2. Update status_langganan yang masih kosong atau NULL ke 'Pending'
    $stmt = $pdo->prepare("UPDATE developers SET status_langganan = 'Pending' WHERE status_langganan = '' OR status_langganan IS NULL");
    $stmt->execute();
    $affected = $stmt->rowCount();

    echo json_encode([
        'status' => true,
        'message' => 'Migrasi sukses! Kolom status_langganan telah diubah dan ' . $affected . ' data berhasil diperbarui ke Pending.'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => false,
        'error' => $e->getMessage()
    ]);
}
?>
