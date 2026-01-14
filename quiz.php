<?php
/**
 * ==========================================================
 * QUIZ CONTROLLER (quiz.php)
 * ==========================================================
 *
 * This controller manages the full lifecycle of a gamified
 * quiz, including:
 *
 * - Quiz initialization and validation
 * - Session-based question progression
 * - Handling of user answers and timeouts
 * - Game restart and navigation logic
 * - Result calculation and persistence
 * - Rendering summary and detailed results
 *
 * KEY DESIGN DECISIONS
 * -------------------
 * - Quiz progress (current question, answers) is stored
 *   in PHP session variables and scoped per quiz.
 * - Client-side game state (score, lives, timer) is handled
 *   by JavaScript for responsiveness.
 * - The `continue=1` query parameter explicitly indicates
 *   an internal quiz flow (POST → redirect → GET).
 * - Any fresh GET request without `continue=1` restarts
 *   the quiz to avoid inconsistent state.
 *
 * ==========================================================
 */
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

// ALWAYS RESTART QUIZ ON FRESH VISIT (GET) UNLESS continue=1
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $isContinue = isset($_GET['continue']) && $_GET['continue'] === '1';

    // if it's NOT an internal flow navigation, restart completely
    if (!$isContinue && !isset($_GET['prev'])) {
        $_SESSION[$quizSessionKey] = array();
        $_SESSION[$currentQuestionKey] = 1;

        $view->showResults = false;
        $view->showDetailedResults = false;
    }
}


/**
 * Post request handling for quiz actions
 */
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // TIMEOUT: advance even if no answer was submitted
    if (isset($_POST['timed_out']) && $_POST['timed_out'] == '1') {

        // IMPORTANT: do NOT store an answer (leave it "unanswered")
        // so results can show "Not answered" and no score is awarded.

        if ($_SESSION[$currentQuestionKey] < $view->totalQuestions) {
            $_SESSION[$currentQuestionKey]++;
            // redirect to next question as an internal continuation
            header('Location: quiz.php?quiz=' . urlencode($quizId) . '&continue=1');
            exit;

        } else {
            $view->showResults = true;
            $view->quizResults = $view->quiz->getQuizResults($_SESSION[$quizSessionKey]);
            $view->detailedResults = $view->quizResults['detailed_results'];

            if ($view->user->isLoggedIn()) {
                $userId = $_SESSION['user_id'];
                $score = $view->quizResults['score'];
                $total = $view->quizResults['total'];
                $percentage = $view->quizResults['percentage'];

                $saved = $view->quizResult->saveResult($userId, $score, $total, $percentage, $quizId);
                $view->resultSaved = ($saved !== false);
            }
        }
    }
    elseif (isset($_POST['answer'])) {
        $questionId = 'q' . $_SESSION[$currentQuestionKey];
        $_SESSION[$quizSessionKey][$questionId] = (int)$_POST['answer'];

        if ($_SESSION[$currentQuestionKey] < $view->totalQuestions) {
            $_SESSION[$currentQuestionKey]++;
            // redirect to next question as an internal continuation
            header('Location: quiz.php?quiz=' . urlencode($quizId) . '&continue=1');
            exit;

        } else {
            $view->showResults = true;
            $view->quizResults = $view->quiz->getQuizResults($_SESSION[$quizSessionKey]);
            $view->detailedResults = $view->quizResults['detailed_results'];

            if ($view->user->isLoggedIn()) {
                $userId = $_SESSION['user_id'];
                $score = $view->quizResults['score'];
                $total = $view->quizResults['total'];
                $percentage = $view->quizResults['percentage'];

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