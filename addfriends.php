<?php
session_start();

require_once("Models/FriendsModel.php");

// Ensure user logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}

$userId = $_SESSION['user_id'];
$model = new FriendsModel();

// Process Add Friend
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['friend_username'])) {
    $result = $model->addFriend($userId, $_POST['friend_username']);

    if ($result !== true) {
        // Save error message for display on profile page
        $_SESSION['friend_error'] = $result;
    }

    header("Location: profile.php");
    exit;
}

// Process Delete Friend
if (isset($_GET['delete'])) {
    $model->deleteFriend($userId, intval($_GET['delete']));
    header("Location: profile.php");
    exit;
}

// Fallback redirect
header("Location: profile.php");
exit;
