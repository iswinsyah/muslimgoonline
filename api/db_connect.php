<?php
// api/db_connect.php
$host = 'localhost';
$dbname = 'u759889304_crmpro';
$username = 'u759889304_admin';
$password = 'Khilafet@1924'; 

try {
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
?>