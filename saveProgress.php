<?php
require_once("Models/UserAuthentication.php");
require_once("Models/ProfileModel.php");

$user = new User();
// Verify user is logged in before saving
if (!$user->isLoggedIn()) {
    http_response_code(403);
    exit("Not logged in");
}

if (!isset($_POST['module'], $_POST['percent'], $_POST['page'])) {
    http_response_code(400);
    exit("Missing data");
}

// Save progress to database
$model = new ProfileModel();
$model->saveProgress($_SESSION['user_id'], $_POST['module'], $_POST['percent'], $_POST['page']);

echo "OK";
?>
