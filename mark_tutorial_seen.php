<?php
require_once('Models/UserAuthentication.php');

$user = new User();
if (!$user->isLoggedIn()) {
    exit;
}

$db = Database::getInstance()->getdbConnection();
$sql = "UPDATE users SET has_seen_tutorial = 1 WHERE id = ?";
$stmt = $db->prepare($sql);
$stmt->execute([$_SESSION['user_id']]);
