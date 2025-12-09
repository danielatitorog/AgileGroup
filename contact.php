<?php
// Include the required model classes
require_once('Models/UserAuthentication.php');

// Create a stdClass object to hold data for the view
$view = new stdClass();
$view->user = new User();               // Instantiate the User object for authentication

require_once('Views/contact.phtml');
