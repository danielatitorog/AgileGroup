<?php
// Models/QuizResult.php

require_once('Database.php');

class QuizResult
{
    protected $_dbHandle, $_dbInstance;

    public function __construct()
    {
        $this->_dbInstance = Database::getInstance();
        $this->_dbHandle = $this->_dbInstance->getdbConnection();
    }

    /**
     * Save quiz result to database
     */
    public function saveResult($userId, $score, $totalQuestions, $percentage)
    {
        try {
            $sql = "INSERT INTO quiz_results (user_id, score, total_questions, percentage) 
                    VALUES (:user_id, :score, :total_questions, :percentage)";

            $statement = $this->_dbHandle->prepare($sql);

            $result = $statement->execute([
                ':user_id' => $userId,
                ':score' => $score,
                ':total_questions' => $totalQuestions,
                ':percentage' => $percentage
            ]);

            return $result ? $this->_dbHandle->lastInsertId() : false;

        } catch (PDOException $e) {
            error_log("Error saving quiz result: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user's quiz results
     */
    public function getUserResults($userId, $limit = 10)
    {
        $sql = "SELECT * FROM quiz_results 
                WHERE user_id = :user_id 
                ORDER BY completed_at DESC 
                LIMIT :limit";

        $statement = $this->_dbHandle->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get user's best score
     */
    public function getUserBestScore($userId)
    {
        $sql = "SELECT MAX(percentage) as best_percentage, 
                       MAX(score) as best_score, 
                       COUNT(*) as total_attempts 
                FROM quiz_results 
                WHERE user_id = :user_id";

        $statement = $this->_dbHandle->prepare($sql);
        $statement->execute([':user_id' => $userId]);

        return $statement->fetch(PDO::FETCH_ASSOC);
    }
}
