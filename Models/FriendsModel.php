<?php

require_once("Database.php");

class FriendsModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getdbConnection();
    }

    public function getFriends($userId)
    {
        $sql = "
        SELECT 
            f.id AS id,
            u.id AS friend_id,
            u.username,
            (
                SELECT ROUND(AVG(COALESCE(ump.progress_percent, 0)))
                FROM modules m
                LEFT JOIN user_module_progress ump
                    ON ump.module_id = m.module_id
                    AND ump.user_id = u.id
            ) AS progress
        FROM friends f
        JOIN users u ON f.friend_id = u.id
        WHERE f.user_id = :uid
    ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(":uid", $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    /** Helper: find a user by username */
    private function findUserByUsername($username)
    {
        $sql = "SELECT id, username, email FROM users WHERE username = :username LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /** Delete a mutual friendship */
    public function deleteFriend($userId, $friendRowId)
    {
        // Find the friend_id from this row
        $sql = "SELECT friend_id FROM friends WHERE id = :id AND user_id = :uid";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ":id" => $friendRowId,
            ":uid" => $userId
        ]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return false;
        }

        $friendId = $row['friend_id'];

        // Delete both sides of the friendship
        $sql = "DELETE FROM friends
            WHERE (user_id = :uid AND friend_id = :fid)
               OR (user_id = :fid AND friend_id = :uid)";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ":uid" => $userId,
            ":fid" => $friendId
        ]);
    }

}
