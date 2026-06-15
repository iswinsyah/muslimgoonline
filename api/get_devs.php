<?php
// api/get_devs.php
header("Content-Type: text/plain");
require_once 'db_connect_pdo.php';

$stmt = $pdo->query("SELECT id, nama_perusahaan, wa_number, status_langganan, ai_cs_instruction FROM developers");
$devs = $stmt->fetchAll(PDO::FETCH_ASSOC);

print_r($devs);
