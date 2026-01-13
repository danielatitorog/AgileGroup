<?php
// Load required model classes that encapsulate core business logic
require_once('Models/UserAuthentication.php');
require_once('Models/Quiz.php');
require_once('Models/QuizResult.php');

// Start the PHP session to enable access to session-based state,
session_start();

// Get which quiz to load
$quizId = isset($_GET['quiz']) ? $_GET['quiz'] : (isset($_SESSION['current_quiz']) ? $_SESSION['current_quiz'] : 'Module1_quiz');

// Validate that the quiz exists
if (!Quiz::quizExists($quizId)) {
    // Quiz doesn't exist, redirect to learning hub
    header('Location: learning-hub.php');
    exit();
}

/**
 * View object used to pass structured data to the template
 */
$view = new stdClass();
$view->user = new User();

// Pass quizId to Quiz constructor
$view->quiz = new Quiz($quizId);
$view->quizResult = new QuizResult();

// Get quiz info (title, description)
$quizInfo = $view->quiz->getQuizInfo();
$view->pageTitle = $quizInfo['title'] . " - Financial Literacy Quiz";
$view->quizTitle = $quizInfo['title'];
$view->quizDescription = $quizInfo['description'];

$view->currentQuestion = 1; //current question index
$view->totalQuestions = $view->quiz->getTotalQuestions(); // total number of questions
$view->userAnswers = array(); // user submitted answers
$view->showResults = false;  // show summary results
$view->showDetailedResults = false; // shows the detailed results
$view->quizResults = null;  //stores processed quiz results
$view->detailedResults = array(); // Array for detailed question results
$view->resultSaved = false;  // indicate whether results were stored in DB

/**
 * Redirect to login page if user is not logged in
 */
if (!$view->user->isLoggedIn()) {
    header('Location: index.php');
    exit();
}

/**
 * Store current quiz in session
 */
$_SESSION['current_quiz'] = $quizId;

/**
 * Initialize quiz-related session variables if accessing for the first time
 * Make session keys specific to each quiz
 */
$quizSessionKey = 'quiz_answers_' . $quizId;
$currentQuestionKey = 'quiz_current_question_' . $quizId;

if (!isset($_SESSION[$quizSessionKey])) {
    $_SESSION[$quizSessionKey] = array();
}

if (!isset($_SESSION[$currentQuestionKey])) {
    $_SESSION[$currentQuestionKey] = 1;
}

/**
 * Post request handling for quiz actions
 */
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['answer'])) {
        // Use quiz-specific session keys
        $questionId = 'q' . $_SESSION[$currentQuestionKey];
        $_SESSION[$quizSessionKey][$questionId] = (int)$_POST['answer'];

        // Move to next question or show results if it is last question
        if ($_SESSION[$currentQuestionKey] < $view->totalQuestions) {
            $_SESSION[$currentQuestionKey]++;
        } else {
            // if user completed the quiz, then show results summary, and process result using "getQuizResults" function from quiz class
            $view->showResults = true;
            $view->quizResults = $view->quiz->getQuizResults($_SESSION[$quizSessionKey]);
            $view->detailedResults = $view->quizResults['detailed_results'];

            // SAVE RESULT TO DATABASE
            if ($view->user->isLoggedIn()) {
                $userId = $_SESSION['user_id'];
                $score = $view->quizResults['score'];
                $total = $view->quizResults['total'];
                $percentage = $view->quizResults['percentage'];

                // Save quiz result
                $saved = $view->quizResult->saveResult($userId, $score, $total, $percentage, $quizId);
                $view->resultSaved = ($saved !== false);
            }
        }
    }
    // Restart the quiz, but only reset session values for THIS quiz
    elseif (isset($_POST['restart'])) {
        $_SESSION[$quizSessionKey] = array();
        $_SESSION[$currentQuestionKey] = 1;
        $view->showResults = false;
        $view->showDetailedResults = false;
    }
    // Show detailed question-by-question results
    elseif (isset($_POST['show_details'])) {
        $view->showResults = true;
        $view->showDetailedResults = true;
        $view->quizResults = $view->quiz->getQuizResults($_SESSION[$quizSessionKey]);
        $view->detailedResults = $view->quizResults['detailed_results'];
    }
    // Hide the detailed results, summary-only mode
    elseif (isset($_POST['hide_details'])) {
        $view->showResults = true;
        $view->showDetailedResults = false;
        $view->quizResults = $view->quiz->getQuizResults($_SESSION[$quizSessionKey]);
    }
}

// Handle GET requests for navigation
if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['prev'])) {
    // navigate to previous question, but not earlier than question #1
    if ($_SESSION[$currentQuestionKey] > 1) {
        $_SESSION[$currentQuestionKey]--;
    }
}

// Use quiz-specific session keys
$view->currentQuestion = $_SESSION[$currentQuestionKey];
$view->userAnswers = $_SESSION[$quizSessionKey];

// loads the question data for the current question
$view->question = $view->quiz->getQuestionById('q' . $view->currentQuestion);

// Include the view template
require_once('Views/quiz.phtml');