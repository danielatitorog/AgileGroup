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

        // Validate password strength
        $validation = $view->user->validatePassword($password);

        if ($validation !== true) {
            $view->errorMessage = $validation;
        } else {
            // Create user object for registering
            $userDataSet = new User();

            if ($userDataSet->register($username, $email, $password)) {

                // Auto-login
                if ($view->user->login($username, $password)) {
                    header("Location: survey.php");
                    exit;
                }

            } else {
                $view->errorMessage = "Username or email already exists.";
            }
        }
    }
}

require_once('Views/learning_hub.phtml');



