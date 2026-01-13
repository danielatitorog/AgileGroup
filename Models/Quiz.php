<?php
/**
 * Quiz class
 * Responsible for:
 * - Loading quiz definitions from JSON files
 * - Providing access to quiz metadata and questions
 * - Validating user answers
 * - Calculating scores
 * - Building structured result objects (including per-question detail)
 */

class Quiz
{
    private $questions;
    private $quizDataPath;
    private $currentQuizId;  // Track which quiz is loaded

    /**
     * Constructor.
     *
     * Initializes the quiz by:
     * - Determining the JSON file path based on the provided quiz ID
     * - Storing the current quiz identifier
     * - Loading questions from the corresponding JSON file
     *
     * @param string $quizId Identifier for the quiz JSON file (without extension).
     *                       Defaults to 'Module1_quiz'.
     */

    public function __construct($quizId = 'Module1_quiz') // MODIFIED: Add parameter
    {
        // Build the full path to the JSON file for the requested quiz
        $this->quizDataPath = __DIR__ . '/../' . $quizId . '.json';
        $this->currentQuizId = $quizId; // Store which quiz we're using
        $this->loadQuestions();
    }

    /**
     * Returns a list of all available quizzes.
     *
     * This method:
     * - Scans for JSON files matching the "Module*_quiz.json" naming convention
     * - Reads basic metadata (title, description, question count) from each file
     * - Returns an associative array keyed by quiz ID
     * @return array Associative array of quizzes:
     */
    public static function getAvailableQuizzes()
    {
        $quizzes = array();
        $files = glob(__DIR__ . '/../Module*_quiz.json');

        foreach ($files as $file) {
            $jsonContent = file_get_contents($file);
            $data = json_decode($jsonContent, true);

            if ($data) {
                $quizId = basename($file, '.json');
                $quizzes[$quizId] = array(
                    'title' => isset($data['title']) ? $data['title'] : 'Untitled Quiz',
                    'description' => isset($data['description']) ? $data['description'] : '',
                    'question_count' => isset($data['questions']) ? count($data['questions']) : 0
                );
            }
        }

        return $quizzes;
    }

    /**
     * Loads quiz questions from the configured JSON file.
     *
     * Behavior:
     * - If the JSON file exists, it is decoded and the "questions" key is extracted.
     * - If the file is missing or invalid, an empty question set is initialized.
     *
     * This method is private because question loading is an internal concern
     * managed via the constructor.
     *
     * @return void
     */
    private function loadQuestions()
    {
        if (file_exists($this->quizDataPath)) {
            $jsonContent = file_get_contents($this->quizDataPath);
            $data = json_decode($jsonContent, true);
            $this->questions = isset($data['questions']) ? $data['questions'] : array();
        } else {
            $this->questions = array();
        }
    }

    /**
     * Retrieves a question by its identifier.
     *
     * Supported ID formats:
     * - The explicit ID stored in the JSON (e.g., "m1_q1")
     * - A simple "qX" format (e.g., "q1"), using the "index" field where available
     * - Fallback by numeric position (e.g., "q1" → first question) for backward compatibility
     *
     * @param string $id Question identifier.
     * @return array|null The question array if found; null otherwise.
     */

    public function getQuestionById($id)
    {
        // Check if ID is like 'm1_q1' or 'q1'
        foreach ($this->questions as $question) {
            if ($question['id'] === $id ||
                ($id === 'q' . (isset($question['index']) ? $question['index'] : '') && isset($question['index']))) {
                return $question;
            }
        }

        // Fallback: Try to find by numeric position (for backward compatibility)
        if (strpos($id, 'q') === 0) {
            $index = intval(substr($id, 1)) - 1;
            if (isset($this->questions[$index])) {
                return $this->questions[$index];
            }
        }

        return null;
    }

    /**
     * Retrieves basic metadata for the currently loaded quiz.
     *
     * Reads from the quiz JSON file (if present) and returns:
     * - Title
     * - Description
     * - Quiz ID
     *
     * If the file does not exist, defaults are returned with the current quiz ID.
     *
     * @return array Associative array:
     *               [
     *                 'title'       => string,
     *                 'description' => string,
     *                 'id'          => string
     *               ]
     */
    public function getQuizInfo()
    {
        if (file_exists($this->quizDataPath)) {
            $jsonContent = file_get_contents($this->quizDataPath);
            $data = json_decode($jsonContent, true);
            return array(
                'title' => isset($data['title']) ? $data['title'] : 'Quiz',
                'description' => isset($data['description']) ? $data['description'] : '',
                'id' => $this->currentQuizId
            );
        }
        // Fallback metadata if the JSON file is not available
        return array('title' => 'Quiz', 'description' => '', 'id' => $this->currentQuizId);
    }

    /**
     * Checks whether a quiz file exists for the given quiz ID.
     *
     * This is useful for validating user input or building navigation routes
     * before attempting to instantiate the Quiz class.
     *
     * @param string $quizId Quiz identifier (without .json extension).
     * @return bool True if the file exists; false otherwise.
     */

    public static function quizExists($quizId)
    {
        $filePath = __DIR__ . '/../' . $quizId . '.json';
        return file_exists($filePath);
    }

    /**
     * Returns all loaded quiz questions.
     *
     * Note: The format of each question depends on the structure of the JSON file,
     * typically including keys such as "id", "question", "options", "correctIndex", "explanation", etc.
     *
     * @return array List of question arrays.
     */

    public function getAllQuestions()
    {
        return $this->questions;
    }

    /**
     * Returns the total number of questions in the current quiz.
     *
     * @return int Question count.
     */

    public function getTotalQuestions()
    {
        return count($this->questions);
    }

    /**
     * Validates whether a selected answer is correct.
     *
     * Flow:
     * - Retrieves the question by its ID.
     * - If not found, returns false (invalid question).
     * - Otherwise, compares the user-selected index against the stored "correctIndex".
     *
     * @param string $questionId    ID of the question being answered.
     * @param int    $selectedIndex Zero-based index of the chosen option.
     * @return bool True if the selected index matches the correct answer; false otherwise.
     */

    public function validateAnswer($questionId, $selectedIndex)
    {
        $question = $this->getQuestionById($questionId);
        // if question is not found, then answer is invalid
        if (!$question) {
            return false;
        }

        return $question['correctIndex'] == $selectedIndex;
    }

    /**
     * Calculates the total score for a set of user-submitted answers.
     * The method:
     * - Iterates over each answer
     * - Validates the answer using validateAnswer()
     * - Increments the score for each correct answer
     * @param array $answers Associative array: questionId => selectedIndex.
     * @return int Total number of correctly answered questions.
     */
    public function calculateScore($answers)
    {
        $score = 0;
        foreach ($answers as $questionId => $selectedIndex) {
            if ($this->validateAnswer($questionId, $selectedIndex)) {
                $score++;
            }
        }
        return $score;
    }

    /**
     * Builds the final quiz result summary.
     * Includes:
     * - Raw score (correct answers)
     * - Total number of questions
     * - Percentage score
     * - Detailed results per question (via getDetailedResults())
     * - A feedback string tailored to the user's performance
     * @param array $answers User-submitted answers (questionId => selectedIndex).
     * @return array Structured result:
     *               [
     *                 'score'            => int,
     *                 'total'            => int,
     *                 'percentage'       => float,
     *                 'detailed_results' => array,
     *                 'feedback'         => string
     *               ]
     */

    public function getQuizResults($answers)
    {
        $results = array();
        $totalQuestions = $this->getTotalQuestions();
        $score = $this->calculateScore($answers);
        // Basic result metrics
        $results['score'] = $score;
        $results['total'] = $totalQuestions;
        $results['percentage'] = round(($score / $totalQuestions) * 100, 2);

        // Add detailed results for each question
        $results['detailed_results'] = $this->getDetailedResults($answers);

        // Add feedback based on user performance/score
        if ($results['percentage'] >= 80) {
            $results['feedback'] = "Excellent! You have a great understanding of investing!";
        } elseif ($results['percentage'] >= 60) {
            $results['feedback'] = "Good job! You have a solid foundation in investing!";
        } elseif ($results['percentage'] >= 40) {
            $results['feedback'] = "Not bad! Keep learning about investing!";
        } else {
            $results['feedback'] = "Keep studying! Check out the Learning Hub for more information!";
        }

        return $results;
    }

    /**
     * Generates detailed results for each question, including:
     * question text, all options, correct answer,
     * user-selected answer (or "Not answered"), correctness flag, and explanation
     * @param array $answers user-submitted answers
     * @return array List of per-question result arrays.
     */
    public function getDetailedResults($answers)
    {
        $detailedResults = array();
        // Loop through all questions sequentially
        for ($i = 1; $i <= $this->getTotalQuestions(); $i++) {
            $questionId = 'q' . $i;
            $question = $this->getQuestionById($questionId);

            if ($question) {
                $userAnswerIndex = isset($answers[$questionId]) ? (int)$answers[$questionId] : null;
                $isCorrect = $userAnswerIndex !== null ? $this->validateAnswer($questionId, $userAnswerIndex) : false;

                $detailedResults[] = array(
                    'id' => $questionId,
                    'question' => $question['question'],
                    'options' => $question['options'],
                    'correct_index' => $question['correctIndex'],
                    'correct_answer' => $question['options'][$question['correctIndex']],
                    'user_answer_index' => $userAnswerIndex,
                    'user_answer' => $userAnswerIndex !== null ? $question['options'][$userAnswerIndex] : 'Not answered',
                    'is_correct' => $isCorrect,
                    'explanation' => $question['explanation']
                );
            }
        }

        return $detailedResults;
    }
}