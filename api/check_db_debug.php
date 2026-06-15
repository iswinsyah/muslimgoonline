<?php
header("Content-Type: application/json");
require_once 'db_connect_pdo.php';

try {
    $schema = $pdo->query("SHOW CREATE TABLE developers")->fetch(PDO::FETCH_ASSOC);
    $users_schema = $pdo->query("SHOW CREATE TABLE users")->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'developers_schema' => $schema,
        'users_schema' => $users_schema
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
