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
     * Fetch user data + modules + progress
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
            'name'    => $row['username'],
            'email'   => $row['email'],
            'joined'  => "N/A",
            'modules' => $this->getUserModules($userId)
        ];
    }

    /**
     * Get last visited slide for the user
     */
    public function getLastVisitedPage($userId)
    {
        $sql = "SELECT last_page_visited
                FROM user_module_progress
                WHERE user_id = :uid
                ORDER BY updated_at DESC
                LIMIT 1";

        $stmt = $this->_dbHandle->prepare($sql);
        $stmt->execute([':uid' => $userId]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['last_page_visited'] : 0; // default to slide 0
    }

    /**
     * Load all modules + user progress
     */
    private function getUserModules($userId)
    {
        $sql = "
            SELECT 
                m.module_id,
                m.module_name,
                m.total_pages,
                IFNULL(ump.progress_percent, 0) AS progress
            FROM modules m
            LEFT JOIN user_module_progress ump
                ON m.module_id = ump.module_id
                AND ump.user_id = :uid
        ";

        $stmt = $this->_dbHandle->prepare($sql);
        $stmt->bindParam(':uid', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $modules = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $modules[] = [
                'title'     => $row['module_name'],
                'completed' => $row['progress']
            ];
        }

        return $modules;
    }

    public function getFriends($userId)
    {
        require_once("FriendsModel.php");
        $friendsModel = new FriendsModel();
        return $friendsModel->getFriends($userId);
    }

    public function saveProgress($userId, $moduleId, $percent, $lastPage)
    {
        $sql = "
        INSERT INTO user_module_progress (user_id, module_id, progress_percent, last_page_visited, updated_at)
        VALUES (:uid, :mid, :percent, :lastPage, datetime('now'))
        ON CONFLICT(user_id, module_id) DO UPDATE SET
            progress_percent = excluded.progress_percent,
            last_page_visited = excluded.last_page_visited,
            updated_at = datetime('now')
        ";

        $stmt = $this->_dbHandle->prepare($sql);

        $stmt->execute([
            ':uid' => $userId,
            ':mid' => $moduleId,
            ':percent' => $percent,
            ':lastPage' => $lastPage
        ]);
    }

    public function getModules()
    {
        $sql = "SELECT module_id, module_name, total_pages FROM modules ORDER BY module_id ASC";
        $stmt = $this->_dbHandle->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
