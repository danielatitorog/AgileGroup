<?php
require_once('Database.php');

/**
 * Class QuizResult
 *
 * Responsible for persisting and retrieving quiz performance data.
 * This model provides:
 * - A unified database connection via the shared Database singleton
 * - Methods to save individual quiz attempts
 * - Methods to retrieve a user's historical results
 * - Methods to compute a user's best performance statistics
 */

class QuizResult
{
    /**
     * @var PDO Underlying PDO database connection handle.
     * @var Database Reference to the Database singleton instance.
     */
    protected $_dbHandle, $_dbInstance;

    /**
     * QuizResult constructor.
     *
     * Initializes database connectivity for this model by:
     * - Acquiring the shared Database instance
     * - Obtaining a PDO connection handle for executing queries
     */

    public function __construct()
    {
        $this->_dbInstance = Database::getInstance();
        $this->_dbHandle = $this->_dbInstance->getdbConnection();
    }

    /**
     * Persist a quiz attempt into the database.
     *
     * Behavior:
     * - Attempts to insert a record into the `quiz_results` table.
     * - Supports an optional quiz identifier (`quiz_id`) for systems
     *   where multiple quizzes are tracked in a single table.
     * - If the `quiz_id` column does not exist or an error referencing
     *   `quiz_id` occurs, it automatically falls back to an insert
     *   statement that omits this column (for backward compatibility).
     *
     * Parameters:
     * - $userId         : The ID of the user who completed the quiz.
     * - $score          : The raw number of correct answers.
     * - $totalQuestions : Total questions that were part of the quiz.
     * - $percentage     : Calculated percentage score (0–100).
     * - $quizId         : Optional quiz identifier (e.g. "Module1_quiz").
     *
     * Return value:
     * - Returns the last inserted record ID on success (string or int depending on PDO driver).
     * - Returns false if the insert fails.
     * @param int|string $userId
     * @param int $score
     * @param int $totalQuestions
     * @param float|int $percentage
     * @param string|null $quizId
     * @return string|false
     */
    public function saveResult($userId, $score, $totalQuestions, $percentage, $quizId)
    {
        try {
            // Check if your table has quiz_id column
            // If yes, use this SQL:
            if ($quizId) {
                $sql = "INSERT INTO quiz_results (user_id, score, total_questions, percentage, quiz_id) 
                        VALUES (:user_id, :score, :total_questions, :percentage, :quiz_id)";

                $statement = $this->_dbHandle->prepare($sql);

                $result = $statement->execute(array(
                    ':user_id' => $userId,
                    ':score' => $score,
                    ':total_questions' => $totalQuestions,
                    ':percentage' => $percentage,
                    ':quiz_id' => $quizId
                ));
            } else {
                // If no quiz_id column or quizId not provided, then use this sql
                $sql = "INSERT INTO quiz_results (user_id, score, total_questions, percentage) 
                        VALUES (:user_id, :score, :total_questions, :percentage)";

                $statement = $this->_dbHandle->prepare($sql);

                $result = $statement->execute(array(
                    ':user_id' => $userId,
                    ':score' => $score,
                    ':total_questions' => $totalQuestions,
                    ':percentage' => $percentage
                ));
            }

            return $result ? $this->_dbHandle->lastInsertId() : false;

        } catch (PDOException $e) {
            // If quiz_id column doesn't exist, fall back to original
            if (strpos($e->getMessage(), 'quiz_id') !== false) {
                $sql = "INSERT INTO quiz_results (user_id, score, total_questions, percentage) 
                        VALUES (:user_id, :score, :total_questions, :percentage)";

                $statement = $this->_dbHandle->prepare($sql);

                $result = $statement->execute(array(
                    ':user_id' => $userId,
                    ':score' => $score,
                    ':total_questions' => $totalQuestions,
                    ':percentage' => $percentage
                ));

                return $result ? $this->_dbHandle->lastInsertId() : false;
            }

            error_log("Error saving quiz result: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Retrieve a list of quiz results for a specific user.
     *
     * Behavior:
     * - Fetches rows from the `quiz_results` table filtered by user_id.
     * - Orders results by the `completed_at` column in descending order
     *   (most recent first).
     * - Applies a configurable LIMIT to avoid returning excessive rows.
     *
     * Parameters:
     * - $userId : The ID of the user whose results should be fetched.
     * - $limit  : Maximum number of rows to return (default: 10).
     *
     * Return value:
     * - Returns an array of associative arrays, each representing a row from `quiz_results`.
     * - Each row includes all columns from the table (SELECT *).
     *
     * @param int|string $userId
     * @param int $limit
     * @return array
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
     * Compute a user's best historical quiz performance.
     * Behavior:
     * - Calculates the maximum percentage achieved by the user across all attempts.
     * - Calculates the maximum raw score achieved.
     * - Counts the total number of attempts recorded for the user.
     * This is useful for:
     * - Displaying personal best stats on dashboards or profile pages.
     * - Tracking improvements over time.
     * Return structure:
     * - [
     *     'best_percentage' => float|null, // Highest percentage achieved
     *     'best_score'      => int|null,   // Highest raw score achieved
     *     'total_attempts'  => int         // Number of records found for the user
     *   ]
     * Note: If the user has no records, the columns may be null depending on the database engine.
     * @param int|string $userId
     * @return array
     */
    public function getUserBestScore($userId)
    {
        $sql = "SELECT MAX(percentage) as best_percentage, 
                       MAX(score) as best_score, 
                       COUNT(*) as total_attempts 
                FROM quiz_results 
                WHERE user_id = :user_id";

        $statement = $this->_dbHandle->prepare($sql);
        $statement->execute(array(':user_id' => $userId));
// Fetch a single row summarizing the user's best performance.
        return $statement->fetch(PDO::FETCH_ASSOC);
    }
}