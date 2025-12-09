<?php
// quiz.php (Controller)

require_once('Models/UserAuthentication.php');
require_once('Models/Quiz.php');
require_once('Models/QuizResult.php');

session_start();

$view = new stdClass();
$view->user = new User();
$view->quiz = new Quiz();
$view->quizResult = new QuizResult();
$view->pageTitle = "Financial Literacy Quiz";
$view->currentQuestion = 1;
$view->totalQuestions = $view->quiz->getTotalQuestions();
$view->userAnswers = [];
$view->showResults = false;
$view->showDetailedResults = false; // New flag for detailed results
$view->quizResults = null;
$view->detailedResults = []; // Array for detailed question results
$view->resultSaved = false;

// Check if user is logged in
if (!$view->user->isLoggedIn()) {
    header('Location: index.php');
    exit();
}

// Initialize session for quiz if not exists
if (!isset($_SESSION['quiz_answers'])) {
    $_SESSION['quiz_answers'] = [];
}

if (!isset($_SESSION['quiz_current_question'])) {
    $_SESSION['quiz_current_question'] = 1;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['answer'])) {
        // Save answer
        $questionId = 'q' . $_SESSION['quiz_current_question'];
        $_SESSION['quiz_answers'][$questionId] = (int)$_POST['answer'];

        // Move to next question or show results
        if ($_SESSION['quiz_current_question'] < $view->totalQuestions) {
            $_SESSION['quiz_current_question']++;
        } else {
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
    } elseif (isset($_POST['restart'])) {
        // Restart quiz
        $_SESSION['quiz_answers'] = [];
        $_SESSION['quiz_current_question'] = 1;
        $view->showResults = false;
        $view->showDetailedResults = false;
    } elseif (isset($_POST['show_details'])) {
        // Show detailed results
        $view->showResults = true;
        $view->showDetailedResults = true;
        $view->quizResults = $view->quiz->getQuizResults($_SESSION['quiz_answers']);
        $view->detailedResults = $view->quizResults['detailed_results'];
    } elseif (isset($_POST['hide_details'])) {
        // Hide detailed results
        $view->showResults = true;
        $view->showDetailedResults = false;
        $view->quizResults = $view->quiz->getQuizResults($_SESSION['quiz_answers']);
    }
}

// Handle GET requests for navigation
if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['prev'])) {
    if ($_SESSION['quiz_current_question'] > 1) {
        $_SESSION['quiz_current_question']--;
    }
}

// Get current question
$view->currentQuestion = $_SESSION['quiz_current_question'];
$view->userAnswers = $_SESSION['quiz_answers'];
$view->question = $view->quiz->getQuestionById('q' . $view->currentQuestion);

// Include the view
require_once('Views/quiz.phtml');