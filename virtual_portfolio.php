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

$view->hasSeenTutorial = $view->user->hasSeenTutorial();

require_once('Views/virtual_portfolio.phtml');