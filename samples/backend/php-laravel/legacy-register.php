<?php
// Legacy PHP User Registration Script
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $email = $_POST['email'];

    if (empty($username) || empty($email)) {
        echo json_encode(["status" => "error", "message" => "Fields required"]);
        exit;
    }

    $conn = mysqli_connect("localhost", "db_user", "db_pass", "legacy_app");
    $sql = "INSERT INTO users (username, email) VALUES ('$username', '$email')";
    $result = mysqli_query($conn, $sql);

    if ($result) {
        echo json_encode(["status" => "success", "user" => ["username" => $username]]);
    }
}
