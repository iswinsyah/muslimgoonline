<?php
// api/temp_check_users.php
header("Content-Type: text/plain");
require_once 'db_connect_pdo.php';

try {
    $stmt = $pdo->query("SELECT u.id, u.nama_user, u.username, u.role, u.status, d.nama_perusahaan, d.status_langganan, d.billing_due_date, d.billing_amount FROM users u LEFT JOIN developers d ON u.developer_id = d.id");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
        echo "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
