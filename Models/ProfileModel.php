<?php

require_once('Database.php');

class ProfileModel
{
    protected $_dbHandle;

    public function __construct()
    {
        $this->_dbHandle = Database::getInstance()->getdbConnection();
    }

    /**
     * Fetch user data from the DB by ID
     */
    public function getUserData($userId)
    {
        $query = "SELECT * FROM users WHERE id = :id LIMIT 1";
        $stmt = $this->_dbHandle->prepare($query);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return [
            'name'   => $row['username'],
            'email'  => $row['email'],
            'joined' => "N/A",

            // Temporary placeholder modules
            'modules' => [
                ['title' => "What is Investment?", 'completed' => 35],
                ['title' => "Saving vs Investing", 'completed' => 60],
                ['title' => "Stocks and Stock Market", 'completed' => 10]
            ]
        ];
    }

    /**
     * Placeholder friend progress (until DB table exists)
     */
    public function getFriends()
    {
        return [
            ['name' => "Jordan", 'modulesCompleted' => 40],
            ['name' => "Taylor", 'modulesCompleted' => 75],
            ['name' => "Sam", 'modulesCompleted' => 20]
        ];
    }
}
