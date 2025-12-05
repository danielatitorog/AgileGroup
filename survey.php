<?php
require_once('Models/UserAuthentication.php');
require_once('Models/Survey.php');

$view = new stdClass();
$view->pageTitle = 'Survey';
$view->user = new User();
$view->survey = new Survey();
$view->errorMessage = '';

// Check if user is logged in
//if (!$view->user->isLoggedIn()) {
   // header("Location: index.php");
   // exit;
//}

// Get survey info
$surveyInfo = $view->survey->getSurveyInfo();
$view->title = $surveyInfo['title'];
$view->description = $surveyInfo['description'];
$view->questions = $view->survey->getAllQuestions();
$view->totalQuestions = $view->survey->getTotalQuestions();

// Check for errors loading survey data
$surveyError = $view->survey->getError();
if (!empty($surveyError)) {
    $view->errorMessage = "Note: " . $surveyError . " Using default questions.";
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // At the moment we're not saving answers, just redirect users to thank you page
    header("Location: survey_thankyou.php");
    exit;
}

require_once('Views/survey_stepbystep.phtml');
