<?php
require_once('Models/Database.php');

// Get database
$_dbInstance = Database::getInstance();
$_dbHandle = $_dbInstance->getdbConnection();

// Get all users with their plaintext password
$statement = $_dbHandle->query("SELECT id, password_hash FROM users");
$users = $statement->fetchAll(PDO::FETCH_ASSOC);

// Process each user to hash their password
foreach ($users as $user) {
    $id = $user["id"];
    $plainPassword = $user["password_hash"];

    // Hash the plaintext password
    $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

    // Update database with the new hashed password
    $update = $_dbHandle->prepare("UPDATE users SET password_hash = :hash WHERE id = :id");
    $update->bindParam(":hash", $hashedPassword);
    $update->bindParam(":id", $id);
    $update->execute();
}

echo "All passwords have been hashed successfully!.";
