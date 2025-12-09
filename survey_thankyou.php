<?php
// Include the UserAuthentication model for user session management
require_once('Models/UserAuthentication.php');
// Initialize a view object to pass data
$view = new stdClass();
$view->user = new User();
// Load and display the thank-you page template
require_once('Views/survey_thankyou.phtml');
