<?php
require_once("Models/ProfileModel.php");
require_once("Models/UserAuthentication.php");
require_once("Models/FriendRequestModel.php");

$view = new stdClass();
$view->user = new User();
$requestModel = new FriendRequestModel();


if (!$view->user->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

$userId = $_SESSION['user_id'];
$view->model = new ProfileModel();

$view->profile = $view->model->getUserData($userId);
$view->friends = $view->model->getFriends($userId);
$view->requests = $requestModel->getIncomingRequests($userId);
$view->sentRequests = $requestModel->getSentRequests($userId);

require("Views/profile.phtml");
