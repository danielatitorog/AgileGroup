<?php
// Include the required model classes
require_once('Models/UserAuthentication.php');

// Create a stdClass object to hold data for the view
$view = new stdClass();
$view->user = new User();               // Instantiate the User object for authentication
$view->authMessage = '';   // Default authentication message


// Get current logged-in user
$view->currentUser = $view->user->getCurrentUser();
$view->userName = $view->currentUser ? $view->currentUser->getUserName() : null;

if (!$view->user->isLoggedIn()) {
    $view->authMessage = "You are not logged in.";
}

// Handle POST requests, form submissions
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    if (isset($_POST["loginBtn"])) {
        $username = trim($_POST["username"]);
        $password = $_POST["password"];
        // Login button pressed from the login form
        if ($view->user->login($username, $password)) {
            $view->authMessage = "Login successful.";
        } else {
            // Login failed: set an error message for the view
            $view->authMessage = "Login error with username or password.";
        }

    } elseif (isset($_POST["logoutBtn"])) {
        // Logout button pressed
        $view->user->logout();      // Clear session and user data
        $view->authMessage = "You have been logged out.";   // Inform user
    }
}

// Include the index view
require_once('Views/index.phtml');
