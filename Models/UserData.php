<?php

/**
 * UserData class
 *
 * Represents a single user record from the database.
 */
class UserData
{

    //Properties for a user record
    protected $_userID, $_username, $_email, $_password, $_role, $_hasSeenTutorial;

    /**
     * Constructor
     *
     * @param array $dbRow A single row of user data from the database
     */
    public function __construct($dbRow)
    {
        $this->_userID = $dbRow['id'];
        $this->_username = $dbRow['username'];
        $this->_email = $dbRow['email'];
        $this->_password = $dbRow['password_hash'];
        $this->_role = $dbRow['role'];
        $this->_hasSeenTutorial = $dbRow['has_seen_tutorial'];
    }

    /** Returns the userID */
    public function getUserID()
    {
        return $this->_userID;
    }

    /** Returns the username */
    public function getUserName()
    {
        return $this->_username;
    }

    /** Returns the user's email */
    public function getUserEmail()
    {
        return $this->_email;
    }

    /** Returns the user's role */
    public function getUserRole()
    {
        return $this->_role;
    }

    public function getUserHasSeenTutorial()
    {
        return $this->_hasSeenTutorial;
    }
}
