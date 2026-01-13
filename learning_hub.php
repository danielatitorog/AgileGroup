<?php

require_once('Models/UserAuthentication.php');
require_once('Models/ProfileModel.php');

// Initialize view object to pass data to template
$view = new stdClass();
$view->user = new User();

// Check if user is logged in, redirect to homepage if not
if (!$view->user->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

// Initialize profile model and load user's module progress
$view->profileModel = new ProfileModel();
$view->modules = $view->profileModel->getModules();

// Load the user's last visited page for resuming their progress
$view->lastPage = $view->profileModel->getLastVisitedPage($_SESSION['user_id']);
$view->visitedSlides = $view->profileModel->getVisitedSlides($_SESSION['user_id']);

// Load the main learning hub view template
require_once('Views/learning_hub.phtml');
