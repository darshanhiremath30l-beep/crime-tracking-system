<?php
header("Content-Type: application/json");

// Database connection
$conn = new mysqli("localhost", "root", "", "live_tracking");

if ($conn->connect_error) {
    die(json_encode(["error" => $conn->connect_error]));
}

$result = $conn->query("SELECT * FROM vehicles");

$vehicles = [];

while ($row = $result->fetch_assoc()) {
    $vehicles[] = $row;
}

echo json_encode($vehicles);
?>

htdocs/live_tracking/get_locations.php   
www/live_tracking/get_locations.php     