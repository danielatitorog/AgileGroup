<?php
require_once('Models/UserDataSet.php');
require_once('Models/UserAuthentication.php');

$view = new stdClass();
$view->user = new User();               // Instantiate the User object for authentication
$view->errorMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $username = trim($_POST['username']);
    $email    = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm  = trim($_POST['confirm']);

    if ($password !== $confirm) {
        $view->errorMessage = "Passwords do not match!";
    } else {
        $userDataSet = new User();

        if ($userDataSet->register($username, $email, $password)) {
            // Automatically log in after registration
            if ($view->user->login($username, $password)) {
                header("Location: index.php"); // change this to the location of the questions
                exit;
            }
        } else {
            $view->errorMessage = "Username or email already exists.";
            //test
        }
    }
}

require_once('Views/register.phtml');

