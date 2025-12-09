<?php

require_once("Database.php");

class FriendsModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getdbConnection();
    }

    /** Fetch all friends for user */
    public function getFriends($userId)
    {
        // Join with users table to get friend info
        $sql = "SELECT f.id AS id,
                       u.id AS friend_id,
                       u.username,
                       u.email
                FROM friends f
                JOIN users u ON f.friend_id = u.id
                WHERE f.user_id = :uid";

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

    /** Add a friend by username */
    public function addFriend($userId, $friendUsername)
    {
        $friendUsername = trim($friendUsername);

        if ($friendUsername === "") {
            return "Please enter a username.";
        }

        // Get current user's username (to block self-add)
        $sql = "SELECT username FROM users WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $userId]);
        $currentUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($currentUser && $currentUser['username'] === $friendUsername) {
            return "You cannot add yourself as a friend.";
        }

        // Check that the friend actually exists
        $friendUser = $this->findUserByUsername($friendUsername);
        if (!$friendUser) {
            return "That user does not exist.";
        }

        $friendId = $friendUser['id'];

        // Check for duplicate friendship
        $sql = "SELECT id FROM friends WHERE user_id = :uid AND friend_id = :fid LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':uid' => $userId,
            ':fid' => $friendId
        ]);

        if ($stmt->fetch()) {
            return "This user is already your friend.";
        }

        // Insert new friend link
        $sql = "INSERT INTO friends (user_id, friend_id)
                VALUES (:uid, :fid)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ":uid" => $userId,
            ":fid" => $friendId
        ]);

        return true;
    }

    /** Delete a friend link (by friends.id) */
    public function deleteFriend($userId, $friendRowId)
    {
        $sql = "DELETE FROM friends
                WHERE id = :id AND user_id = :uid";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ":id"  => $friendRowId,
            ":uid" => $userId
        ]);
    }
}
