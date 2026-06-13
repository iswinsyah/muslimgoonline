<?php
// api/db_connect.php
$host = 'localhost';
$dbname = 'u829486010_crmprosyar';
$username = 'u829486010_crmprosyar';
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