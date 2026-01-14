<?php
require_once("Models/UserAuthentication.php");
require_once("Models/ProfileModel.php");

$user = new User();
if (!$user->isLoggedIn()) {
    http_response_code(403);
    exit("Not logged in");
}

if (!isset($_POST['slide'])) {
    http_response_code(400);
    exit("Missing data");
}

$slide = (int)$_POST['slide'];

$model = new ProfileModel();
$model->saveSlideVisit($_SESSION['user_id'], $slide);

echo "OK";
?>
