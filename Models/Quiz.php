<?php
/**
 * Quiz class
 * Handles loading quiz questions, validating answers, scoring,
 * and generating detailed quiz results.
 */

class Quiz
{
    private $questions;
    private $quizDataPath;

    /**
     * Constructor
     * Initializes the location of the quiz data file and loads questions from the JSON file.
     */
    public function __construct()
    {
        $this->quizDataPath = __DIR__ . '/../Quiz_Questions.json';
        $this->loadQuestions();
    }

    /**
     * Load quiz question form the JSON file.
     * If the file exists, it decodes the JSON into an array
     * otherwise, it initializes an empty question set
     */
    private function loadQuestions()
    {
        if (file_exists($this->quizDataPath)) {
            $jsonContent = file_get_contents($this->quizDataPath);
            $this->questions = json_decode($jsonContent, true);
        } else {
            $this->questions = [];
        }
    }

    /**
     * Returns all quiz questions.
     * @return array
     */
    public function getAllQuestions()
    {
        return $this->questions;
    }

    /**
     * Retrieves a single question by its ID
     * @param  string $id The unique ID of the question
     * @return array|null Returns the question data or null if not found.
     */
    public function getQuestionById($id)
    {
        foreach ($this->questions as $question) {
            if ($question['id'] === $id) {
                return $question;
            }
        }
        return null;
    }

    /**
     * Returns the total number of quiz questions
     * @return int
     */
    public function getTotalQuestions()
    {
        return count($this->questions);
    }

    /**
     * validates whether the selected answer is correct
     * @param string $questionId ID of the question
     * @param  int $selectedIndex Answer index chosen by the user
     * @return bool True if correct, false otherwise
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
     * Calculates the total score for a given set of answers
     * @param array $answers Associative array: questionId => selectedIndex
     * @return int Total number of correct answers
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
     * Generates the final quiz result, including:
     * Score, total questions, percentage, detailed per-question result, and performance feedback
     * @param array $answers user-submitted answers
     * @return array structured results
     */
    public function getQuizResults($answers)
    {
        $results = [];
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
     * @return array
     */
    public function getDetailedResults($answers)
    {
        $detailedResults = [];
        // Loop through all questions sequentially
        for ($i = 1; $i <= $this->getTotalQuestions(); $i++) {
            $questionId = 'q' . $i;
            $question = $this->getQuestionById($questionId);

            if ($question) {
                $userAnswerIndex = isset($answers[$questionId]) ? (int)$answers[$questionId] : null;
                $isCorrect = $userAnswerIndex !== null ? $this->validateAnswer($questionId, $userAnswerIndex) : false;

                $detailedResults[] = [
                    'id' => $questionId,
                    'question' => $question['question'],
                    'options' => $question['options'],
                    'correct_index' => $question['correctIndex'],
                    'correct_answer' => $question['options'][$question['correctIndex']],
                    'user_answer_index' => $userAnswerIndex,
                    'user_answer' => $userAnswerIndex !== null ? $question['options'][$userAnswerIndex] : 'Not answered',
                    'is_correct' => $isCorrect,
                    'explanation' => $question['explanation']
                ];
            }
        }

        return $detailedResults;
    }
}