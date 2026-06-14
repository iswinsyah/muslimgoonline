<?php
require_once 'api/db_connect_pdo.php';
try {
    $stmt = $pdo->query("SELECT id, nama_perusahaan, ai_persona_insight FROM developers");
    $devs = $stmt->fetchAll();
    echo "<pre>";
    print_r($devs);
    echo "</pre>";
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
