<?php

// Include the required model classes
require_once('Models/UserAuthentication.php');
require_once('Models/ProfileModel.php');

// Create a stdClass object to hold data for the view
$view = new stdClass();
$view->user = new User();       // Instantiate the User object for authentication

if (!$view->user->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

$view->profileModel = new ProfileModel();
$view->modules = $view->profileModel->getModules(); // We'll write this function next


require_once('Views/roadmap.phtml');