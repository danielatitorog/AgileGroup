<?php

require_once("Database.php");

class FriendRequestModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getdbConnection();
    }

    /** Send a friend request */
    public function sendRequest($senderId, $receiverUsername)
    {
        // Prevent empty
        $receiverUsername = trim($receiverUsername);
        if ($receiverUsername == "") {
            return "Enter a username.";
        }

        // Find receiver
        $sql = "SELECT id FROM users WHERE username = :username LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':username' => $receiverUsername]);
        $receiver = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$receiver) return "User not found.";

        $receiverId = $receiver['id'];

        // Prevent adding yourself
        if ($receiverId == $senderId) {
            return "You cannot add yourself.";
        }

        // Already friends?
        $sql = "SELECT id FROM friends WHERE user_id = :u AND friend_id = :f LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':u' => $senderId, ':f' => $receiverId]);
        if ($stmt->fetch()) return "Already friends.";

        // Pending request?
        $sql = "SELECT id FROM friend_requests 
                WHERE sender_id = :s AND receiver_id = :r LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':s' => $senderId, ':r' => $receiverId]);
        if ($stmt->fetch()) return "Request already sent.";

        // Insert new request
        $sql = "
            INSERT INTO friend_requests (sender_id, receiver_id)
            VALUES (:s, :r)
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':s' => $senderId, ':r' => $receiverId]);

        return true;
    }

    /** Accept request */
    public function acceptRequest($requestId, $receiverId)
    {
        // Fetch request
        $sql = "SELECT * FROM friend_requests WHERE id = :id AND receiver_id = :rid LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $requestId, ':rid' => $receiverId]);
        $req = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$req) return false;

        $senderId = $req['sender_id'];

        // Add mutual friendship
        $sql = "INSERT INTO friends (user_id, friend_id) VALUES (:u, :f)";
        $stmt = $this->db->prepare($sql);

        $stmt->execute([':u' => $receiverId, ':f' => $senderId]);
        $stmt->execute([':u' => $senderId, ':f' => $receiverId]);

        // Delete the request
        $sql = "DELETE FROM friend_requests WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $requestId]);

        return true;
    }

    /** Decline request */
    public function declineRequest($requestId, $receiverId)
    {
        $sql = "DELETE FROM friend_requests WHERE id = :id AND receiver_id = :rid";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $requestId, ':rid' => $receiverId]);
    }

    /** Load incoming requests for a user */
    public function getIncomingRequests($userId)
    {
        $sql = "
            SELECT fr.id AS request_id, u.username AS sender_username, u.id AS sender_id
            FROM friend_requests fr
            JOIN users u ON u.id = fr.sender_id
            WHERE fr.receiver_id = :uid AND fr.status = 'pending'
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Load requests *sent* by a user */
    public function getSentRequests($userId)
    {
        $sql = "
        SELECT fr.id AS request_id, u.username AS receiver_username, u.id AS receiver_id
        FROM friend_requests fr
        JOIN users u ON u.id = fr.receiver_id
        WHERE fr.sender_id = :uid AND fr.status = 'pending'
    ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}
