<?php
require_once("Models/ProfileModel.php");
require_once("Models/UserAuthentication.php");
require_once("Models/FriendRequestModel.php");

$view = new stdClass();
$view->user = new User();
$requestModel = new FriendRequestModel();

// Check if user is logged in, otherwise redirect to homepage
if (!$view->user->isLoggedIn()) {
    header("Location: index.php");
    exit;
}


$userId = $_SESSION['user_id']; // Get current userID from session
$view->model = new ProfileModel(); // Load user data

$view->profile = $view->model->getUserData($userId); // Load user information
$view->friends = $view->model->getFriends($userId); // Load user friend list
// Load incoming and outgoing friend requests
$view->requests = $requestModel->getIncomingRequests($userId); 
$view->sentRequests = $requestModel->getSentRequests($userId);

require("Views/profile.phtml");
