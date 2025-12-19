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
        }

        // Session timeout (1 hour)
        $timeout = 3600; // 1 hour

        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
            $this->logout();
        } else {
            $_SESSION['last_activity'] = time();
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
            session_regenerate_id(true);

            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['role'] = $row['role'];
            $_SESSION['last_activity'] = time(); // Session time-out

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

    public function validatePassword($password)
    {
        // Length requirement
        if (strlen($password) < 8) {
            return "Password must be at least 8 characters long.";
        }

        // Character mix requirement: uppercase, lowercase, number, symbol
        if (
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password) ||
            !preg_match('/[\W_]/', $password) // symbols & underscore
        ) {
            return "Password must include uppercase, lowercase, numbers, and symbols.";
        }

        // Basic dictionary word / name protection
        // This prevents users from using common words
        $commonWords = ['password', 'qwerty', 'letmein', 'welcome', 'admin', 'user'];

        foreach ($commonWords as $word) {
            if (stripos($password, $word) !== false) {
                return "Password cannot contain common dictionary words.";
            }
        }

        return true; // Passed validation
    }


}