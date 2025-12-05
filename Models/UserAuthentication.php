<?php

require_once('Database.php');
require_once('UserData.php');

/**
 * User class
 *
 * Handles user authentication, sessions, and retrieving user information.
 */
class User
{
    //Database connection variables
    protected $_dbHandle, $_dbInstance, $_currentUser;

    /**
     * Constructor
     *
     * Connects to the database and starts a session
     * If a user is logged in, it loads their user data
     */
    public function __construct()
    {
        $this->_dbInstance = Database::getInstance();
        $this->_dbHandle = $this->_dbInstance->getdbConnection();
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
            session_regenerate_id(true); // helps prevent session fixation
        }

        // If already logged in, populate current user
        if ($this->isLoggedIn()) {
            $this->_currentUser = $this->getCurrentUser();
        }
    }

    /**
     * Attempt to log a user in.
     *
     * @param string $username The username entered by the user
     * @param string $password The password entered by the user
     * @return bool True is login successful, false otherwise
     */
    public function login($username, $password)
    {
        $sqlQuery = "SELECT * FROM users WHERE username = :username LIMIT 1";
        $statement = $this->_dbHandle->prepare($sqlQuery);
        $statement->bindParam(':username', $username, PDO::PARAM_STR);
        $statement->execute();

        $row = $statement->fetch(PDO::FETCH_ASSOC);

        // Verify password and start session
        if ($row && password_verify($password, $row['password_hash'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['role'] = $row['role'];

            $this->_currentUser = new UserData($row);
            return true;
        }

        return false; // login failed
    }

    /**
     * Log the current user out and destroy the session.
     */
    public function logout()
    {
        session_unset();
        session_destroy();
        $this->_currentUser = null;
    }

    /**
     * Check if a user is currently logged in.
     *
     * @return bool True if logged in, false otherwise
     */
    public function isLoggedIn()
    {
        return isset($_SESSION['user_id']);
    }

    /**
     * Get the current logged-in user's data
     *
     * @return UserData|null Returns a UserData object or null if not logged in
     */
    public function getCurrentUser()
    {
        if ($this->isLoggedIn()) {
            $sqlQuery = "SELECT * FROM users WHERE id = :id LIMIT 1";
            $statement = $this->_dbHandle->prepare($sqlQuery);
            $statement->bindParam(':id', $_SESSION['user_id'], PDO::PARAM_INT);
            $statement->execute();

            $row = $statement->fetch(PDO::FETCH_ASSOC);
            return $row ? new UserData($row) : null;
        }

        return null;
    }

    public function register($username, $email, $password)
    {
        // Validate password
        if (!$this->isPasswordStrong($password)) {
            return "Password does not meet the security requirements.";
        }

        $sql = "INSERT INTO users (username, email, password_hash) 
            VALUES (:username, :email, :password_hash)";
        $statement = $this->_dbHandle->prepare($sql);

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        try {
            $statement->execute([
                ':username'      => $username,
                ':email'         => $email,
                ':password_hash' => $passwordHash
            ]);

            return true;
        } catch (PDOException $e) {
            return false; // Duplicate username/email or other DB error
        }
    }

    private function isPasswordStrong($password)
    {
        // Requirement 1: At least 12 characters long (14+ recommended)
        if (strlen($password) < 12) {
            return false;
        }

        // Requirement 2: Combination of uppercase, lowercase, numbers, and symbols
        $hasUpper = preg_match('/[A-Z]/', $password);
        $hasLower = preg_match('/[a-z]/', $password);
        $hasNumber = preg_match('/[0-9]/', $password);
        $hasSymbol = preg_match('/[\W_]/', $password);

        if (!$hasUpper || !$hasLower || !$hasNumber || !$hasSymbol) {
            return false;
        }

        // Requirement 3: Not dictionary-like or a common name (basic check)
        // You can expand this list if needed
        $weakWords = ['password', 'qwerty', 'letmein', 'admin', 'welcome', 'dragon', 'football'];
        foreach ($weakWords as $word) {
            if (stripos($password, $word) !== false) {
                return false;
            }
        }

        // Prevent passwords containing the username or the email local-part
        // (you can pass these into the function if needed)
        return true;
    }

}