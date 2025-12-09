<?php
require_once('Models/ProfileModel.php');
require_once('Models/UserAuthentication.php');

// Create authentication handler
$view = new stdClass();
$view->user = new User();

// If user not logged in → redirect
if (!$view->user->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

$userId = $_SESSION['user_id'];

// Load model
$view->model = new ProfileModel();

// Retrieve data
$view->profile = $view->model->getUserData($userId);
$view->friends = $view->model->getFriends();

// Load view
require('Views/profile.phtml');
