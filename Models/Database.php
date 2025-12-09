<?php

/**
 * Database class
 *
 * This class manages a single connection to a SQLite database
 * using the Singleton design pattern.
 */
class Database
{
    /**
     * @var Database|null Stores the single instance of this class
     */
    protected static $_dbInstance = null;

    /**
     * @var PDO The PDO connection handle
     */
    protected $_dbHandle;

    /**
     * Returns the single instance of the Database class.
     * If it does not exist, it creates one.
     */
    public static function getInstance()
    {
        // If no instance exists, create one
        if (self::$_dbInstance === null) {
            self::$_dbInstance = new self();
        }
        // Return the single instance
        return self::$_dbInstance;
    }

    /**
     * Private constructor
     *
     * Creates a new PDO connection to the SQLite database.
     */
    private function __construct()
    {
        try {
            // Connect to SQLite database file
            $this->_dbHandle = new PDO("sqlite:youthinvest.sqlite");
            // Enable exceptions for error handling
            $this->_dbHandle->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {//catch any failure to the database
            // Output any connection error messages
            echo $e->getMessage();
        }
    }

    /**
     * Returns the active PDO connection
     */
    public function getdbConnection()
    {
        return $this->_dbHandle;
    }

    /**
     * Destructor
     *
     * Closes the database connection when the object is destroyed.
     */
    public function __destruct()
    {
        $this->_dbHandle = null; //destroys the PDO handle when no longer needed
    }
}