<?php
//Load required classes
require_once('Models/UserAuthentication.php');
require_once('Models/Quiz.php');
require_once('Models/QuizResult.php');

session_start();
/**
 * View object used to pass structured data to the template
 */
$view = new stdClass();
$view->user = new User();
$view->quiz = new Quiz();
$view->quizResult = new QuizResult();
$view->pageTitle = "Financial Literacy Quiz";
$view->currentQuestion = 1; //current question index
$view->totalQuestions = $view->quiz->getTotalQuestions(); // total number of questions
$view->userAnswers = []; // user submitted answers
$view->showResults = false;  // show summary results
$view->showDetailedResults = false; // shows the detailed results
$view->quizResults = null;  //stores processed quiz results
$view->detailedResults = []; // Array for detailed question results
$view->resultSaved = false;  // indicate whether results were stored in DB

/**
 * Redirect to login page if user is not logged in
 */
if (!$view->user->isLoggedIn()) {
    header('Location: index.php');
    exit();
}
/**
 * Initialize quiz-related session variables if accessing for the first time
 */
if (!isset($_SESSION['quiz_answers'])) {
    $_SESSION['quiz_answers'] = [];
}

if (!isset($_SESSION['quiz_current_question'])) {
    $_SESSION['quiz_current_question'] = 1;
}
/**
 * Post request handling for quiz actions
 */
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['answer'])) {
        // the question ID is based on sequential numbering, and save answer to session
        $questionId = 'q' . $_SESSION['quiz_current_question'];
        $_SESSION['quiz_answers'][$questionId] = (int)$_POST['answer'];

        // Move to next question or show results if it is last question
        if ($_SESSION['quiz_current_question'] < $view->totalQuestions) {
            $_SESSION['quiz_current_question']++;
        } else {
            // if user completed the quiz, then show results summary, and process result using "getQuizResults" function from quiz class
            $view->showResults = true;
            $view->quizResults = $view->quiz->getQuizResults($_SESSION['quiz_answers']);
            $view->detailedResults = $view->quizResults['detailed_results'];
            // SAVE RESULT TO DATABASE
            if ($view->user->isLoggedIn()) {
                $userId = $_SESSION['user_id'];
                $score = $view->quizResults['score'];
                $total = $view->quizResults['total'];
                $percentage = $view->quizResults['percentage'];

                $saved = $view->quizResult->saveResult($userId, $score, $total, $percentage);
                $view->resultSaved = ($saved !== false);
            }
        }
    }
     // Restart the quiz, but only reset session values
    elseif (isset($_POST['restart'])) {
        $_SESSION['quiz_answers'] = [];
        $_SESSION['quiz_current_question'] = 1;
        $view->showResults = false;
        $view->showDetailedResults = false;
    }
    // Show detailed question-by-question results
    elseif (isset($_POST['show_details'])) {
        $view->showResults = true;
        $view->showDetailedResults = true;
        $view->quizResults = $view->quiz->getQuizResults($_SESSION['quiz_answers']);
        $view->detailedResults = $view->quizResults['detailed_results'];
    }
    // Hide the detailed results, summary-only mode
    elseif (isset($_POST['hide_details'])) {
        $view->showResults = true;
        $view->showDetailedResults = false;
        $view->quizResults = $view->quiz->getQuizResults($_SESSION['quiz_answers']);
    }
}

// Handle GET requests for navigation
if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['prev'])) {
    // navigate to previous question, but not earlier than question #1
    if ($_SESSION['quiz_current_question'] > 1) {
        $_SESSION['quiz_current_question']--;
    }
}

// update view variables based on the first state after processing inputs
$view->currentQuestion = $_SESSION['quiz_current_question'];
$view->userAnswers = $_SESSION['quiz_answers'];
// loads the question data for the current question
$view->question = $view->quiz->getQuestionById('q' . $view->currentQuestion);

// Include the view template
require_once('Views/quiz.phtml');