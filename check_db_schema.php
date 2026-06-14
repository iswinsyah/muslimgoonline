<?php
header("Content-Type: application/json");
require_once 'api/db_connect_pdo.php';
try {
    $stmt = $pdo->query("DESCRIBE developers");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
