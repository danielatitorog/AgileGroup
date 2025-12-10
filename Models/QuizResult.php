<?php
require_once('Database.php');

/**
 * QuizResult class
 * Responsible for persisting and retrieving quiz results
 * from the database for individual users.
 */
class QuizResult
{
    /**
     * @var PDO Database connection handle
     * @var Database Instance of the database
     */
    protected $_dbHandle, $_dbInstance;

    /**
     * QuizResult constructor
     * Initializes the database instance and stores the PDO connection handle
     * for use in all query methods.
     */
    public function __construct()
    {
        // Get the Database instance
        $this->_dbInstance = Database::getInstance();
        // Retrieve the PDO database connection from the Database instance
        $this->_dbHandle = $this->_dbInstance->getdbConnection();
    }

    /**
     * Save quiz result to database
     * Persists a single quiz attempt to the quiz-result table
     * Uses prepared statements to prevent SQL injection and ensure
     * safe parameter binding
     * @param int $userId ID of the user who completed the quiz
     * @param int $score number of correctly answered questions
     * @param int $totalQuestions Total number of questions in the quiz
     * @return int $percentage score as a percentage
     * @return int|false returns the inserted row on success, or false on failure
     */
    public function saveResult($userId, $score, $totalQuestions, $percentage)
    {
        try {
            //SQL statement for inserting a new quiz result
            $sql = "INSERT INTO quiz_results (user_id, score, total_questions, percentage) 
                    VALUES (:user_id, :score, :total_questions, :percentage)";

            $statement = $this->_dbHandle->prepare($sql);
            // Execute the statement with bound parameters
            $result = $statement->execute([
                ':user_id' => $userId,
                ':score' => $score,
                ':total_questions' => $totalQuestions,
                ':percentage' => $percentage
            ]);
            // on success, return the ID of the newly inserted record
            return $result ? $this->_dbHandle->lastInsertId() : false;

        } catch (PDOException $e) {
            // Log the exception for debugging without exposing details to the user
            error_log("Error saving quiz result: " . $e->getMessage());
            // Return false to indicate failure
            return false;
        }
    }

    /**
     * Get user's quiz results
     * Fetches a list of quiz attempts for a given user ordered by
     * completion time (latest first). A limit can be applied to
     * restrict the number of attempt returned
     * @param int $userId ID of the user who results are being requested
     * @param int $limit Maximum number of results to return (default: 10)
     * @return array List of quiz results rows as associative arrays
     */
    public function getUserResults($userId, $limit = 10)
    {
        //SQL query selecting results for a given user ordered by completion time
        $sql = "SELECT * FROM quiz_results 
                WHERE user_id = :user_id 
                ORDER BY completed_at DESC 
                LIMIT :limit";
        // Prepare the query and bind parameters
        $statement = $this->_dbHandle->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute(); // Execute the query
        //return all matching quiz attempts as an array
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get a user's best score summary
     * Returns aggregate statistics for a given user, including:
     * best_percentage: the highest percentage achieved
     * best_score: the highest score achieved
     * total_attempts: the total number of quiz attempts
     * @param int $userId ID of the user
     * @return array|false Associative array of stats, or false if query fails
     * Keys: best_percentage, best_score, total_attempts
     */
    public function getUserBestScore($userId)
    {
        // Aggregate query to compute max percentage, max score, and total attempts
        $sql = "SELECT MAX(percentage) as best_percentage, 
                       MAX(score) as best_score, 
                       COUNT(*) as total_attempts 
                FROM quiz_results 
                WHERE user_id = :user_id";
        // Prepare and execute the statement with user ID bound
        $statement = $this->_dbHandle->prepare($sql);
        $statement->execute([':user_id' => $userId]);
        // Returns a single associative row containing the aggregated values
        return $statement->fetch(PDO::FETCH_ASSOC);
    }
}
