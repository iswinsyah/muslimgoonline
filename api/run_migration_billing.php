<?php
// api/run_migration_billing.php
header("Content-Type: text/plain");
require_once 'db_connect_pdo.php';

try {
    echo "Memulai migrasi database billing...\n\n";

    // 1. Cek & Tambah kolom billing_due_date di tabel developers
    $stmt = $pdo->query("SHOW COLUMNS FROM developers LIKE 'billing_due_date'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN billing_due_date DATE DEFAULT NULL");
        echo "[OK] Kolom 'billing_due_date' berhasil ditambahkan ke tabel developers.\n";
    } else {
        echo "[INFO] Kolom 'billing_due_date' sudah ada.\n";
    }

    // 2. Cek & Tambah kolom billing_amount di tabel developers
    $stmt = $pdo->query("SHOW COLUMNS FROM developers LIKE 'billing_amount'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE developers ADD COLUMN billing_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00");
        echo "[OK] Kolom 'billing_amount' berhasil ditambahkan ke tabel developers.\n";
    } else {
        echo "[INFO] Kolom 'billing_amount' sudah ada.\n";
    }

    // 3. Tambahkan ENUM 'Inactive' ke kolom status_langganan jika belum ada
    // Untuk keamanan lintas versi MySQL, kita alter saja kolom status_langganan agar menyertakan 'Inactive'
    $pdo->exec("ALTER TABLE developers MODIFY COLUMN status_langganan ENUM('Active', 'Inactive', 'Pending', 'Rejected') DEFAULT 'Pending'");
    echo "[OK] Definisi enum 'status_langganan' diperbarui.\n";

    // 4. Buat tabel payment_confirmations
    $sqlTable = "CREATE TABLE IF NOT EXISTS payment_confirmations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        developer_id INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        payment_proof VARCHAR(255) NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP NULL,
        FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    $pdo->exec($sqlTable);
    echo "[OK] Tabel 'payment_confirmations' berhasil diverifikasi/dibuat.\n";

    // 5. Inisialisasi data default untuk tenant yang sudah ada agar tidak langsung terblokir
    $updatedDue = $pdo->exec("UPDATE developers SET billing_due_date = DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY) WHERE billing_due_date IS NULL");
    $updatedAmount = $pdo->exec("UPDATE developers SET billing_amount = 150000.00 WHERE billing_amount = 0.00 OR billing_amount IS NULL");
    
    echo "[OK] Inisialisasi data default selesai. ($updatedDue tenant jatuh tempo di-set, $updatedAmount tenant nominal di-set).\n\n";
    echo "Migrasi database selesai dengan sukses!";

} catch (PDOException $e) {
    http_response_code(500);
    echo "[ERROR] Migrasi gagal: " . $e->getMessage();
}
?>
