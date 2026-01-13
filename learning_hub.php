<?php

require_once('Models/UserAuthentication.php');
require_once('Models/ProfileModel.php');

$view = new stdClass();
$view->user = new User();

if (!$view->user->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

$view->profileModel = new ProfileModel();
$view->modules = $view->profileModel->getModules();

// NEW: load last visited slide
$view->lastPage = $view->profileModel->getLastVisitedPage($_SESSION['user_id']);

require_once('Views/learning_hub.phtml');
