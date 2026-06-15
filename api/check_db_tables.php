<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';
try {
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_NUM);
    echo json_encode(['tables' => $tables]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
