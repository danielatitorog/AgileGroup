<?php
// Models/Quiz.php

class Quiz
{
    private $questions;
    private $quizDataPath;

    public function __construct()
    {
        $this->quizDataPath = __DIR__ . '/../Quiz_Questions.json';
        $this->loadQuestions();
    }

    private function loadQuestions()
    {
        if (file_exists($this->quizDataPath)) {
            $jsonContent = file_get_contents($this->quizDataPath);
            $this->questions = json_decode($jsonContent, true);
        } else {
            $this->questions = [];
        }
    }

    public function getAllQuestions()
    {
        return $this->questions;
    }

    public function getQuestionById($id)
    {
        foreach ($this->questions as $question) {
            if ($question['id'] === $id) {
                return $question;
            }
        }
        return null;
    }

    public function getTotalQuestions()
    {
        return count($this->questions);
    }

    public function validateAnswer($questionId, $selectedIndex)
    {
        $question = $this->getQuestionById($questionId);
        if (!$question) {
            return false;
        }

        return $question['correctIndex'] == $selectedIndex;
    }

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

    public function getQuizResults($answers)
    {
        $results = [];
        $totalQuestions = $this->getTotalQuestions();
        $score = $this->calculateScore($answers);

        $results['score'] = $score;
        $results['total'] = $totalQuestions;
        $results['percentage'] = round(($score / $totalQuestions) * 100, 2);

        // Add detailed results for each question
        $results['detailed_results'] = $this->getDetailedResults($answers);

        // Add feedback based on score
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

    public function getDetailedResults($answers)
    {
        $detailedResults = [];

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