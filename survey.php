<?php
// Include required model classes
require_once('Models/UserAuthentication.php');
require_once('Models/Survey.php');
// Initialize view object to pass data
$view = new stdClass();
$view->pageTitle = 'Survey';
$view->user = new User();
$view->errorMessage = '';

if (!$view->user->isLoggedIn()) {
    header("Location: index.php");
    exit;
}

/**Check if this is a survey submission user answering questions
 * This handles the POST request when survey answers are submitted
 * currently just redirects user to thank you page - answers are not being saved
 **/

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['age_group'])) {
    header("Location: survey_thankyou.php");
    exit;
}

// Check if this is age group selection
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['age_group'])) {
    // Age selection form submitted
    $ageGroup = $_POST['age_group'];
    $validAgeGroups = ['12-14', '15-18']; // Define valid age groups

    if (in_array($ageGroup, $validAgeGroups)) {
        // Age group is valid - store it for this session
        $selectedAgeGroup = $ageGroup;

        // Initialize Survey class with selected age group
        $view->survey = new Survey($selectedAgeGroup);

        // Get survey data
        $surveyInfo = $view->survey->getSurveyInfo();
        $view->title = $surveyInfo['title'];
        $view->description = $surveyInfo['description'];
        $view->ageGroup = $surveyInfo['ageGroup'];
        $view->questions = $view->survey->getAllQuestions();
        $view->totalQuestions = $view->survey->getTotalQuestions();

        // Check if there were any error loading the survey data
        $surveyError = $view->survey->getError();
        if (!empty($surveyError)) {
            // display warning but continue with default questions
            $view->errorMessage = "Note: " . $surveyError . " Using default questions.";
        }

        // Load the survey questions page
        require_once('Views/survey_questions.phtml');
        exit;
    }
}

//  Default behaviour, show the age selection page
require_once('Views/survey_age.phtml');