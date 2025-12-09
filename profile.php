<?php
require_once("Models/ProfileModel.php");
require_once("Models/UserAuthentication.php");

$view = new stdClass();
$view->user = new User();

if (!$view->user->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

$userId = $_SESSION['user_id'];
$view->model = new ProfileModel();

$view->profile = $view->model->getUserData($userId);
$view->friends = $view->model->getFriends($userId);

require("Views/profile.phtml");
