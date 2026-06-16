<?php
// api/temp_simulate_billing.php
header("Content-Type: text/plain");
require_once 'db_connect_pdo.php';

try {
    $password_hash = password_hash('123456', PASSWORD_DEFAULT);
    
    // 1. Reset password haikal
    $stmt1 = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'haikal'");
    $stmt1->execute([$password_hash]);
    echo "[OK] Password haikal di-reset ke '123456'.\n";

    // 2. Set VQ Land (ID = 3) status_langganan = 'Inactive'
    $stmt2 = $pdo->prepare("UPDATE developers SET status_langganan = 'Inactive', billing_amount = 150000.00, wa_number = '6285196642799' WHERE id = 3");
    $stmt2->execute();
    echo "[OK] Developer VQ Land (ID=3) di-set ke Inactive.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
