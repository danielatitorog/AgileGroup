<?php
session_start();

require_once("Models/FriendRequestModel.php");
require_once("Models/FriendsModel.php");

if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}

$userId = $_SESSION['user_id'];
$reqModel = new FriendRequestModel();
$friendModel = new FriendsModel();

// Send request
if (isset($_POST['friend_username'])) {
    $result = $reqModel->sendRequest($userId, $_POST['friend_username']);
    $_SESSION['friend_message'] = $result === true ?
        "Friend request sent!" : $result;
    header("Location: profile.php");
    exit;
}

// Accept request
if (isset($_POST['accept_request'])) {
    $reqModel->acceptRequest($_POST['accept_request'], $userId);
    header("Location: profile.php");
    exit;
}

// Decline request
if (isset($_POST['decline_request'])) {
    $reqModel->declineRequest($_POST['decline_request'], $userId);
    header("Location: profile.php");
    exit;
}

// Remove friend
if (isset($_POST['delete_friend'])) {
    $friendModel->deleteFriend($userId, $_POST['delete_friend']);
    header("Location: profile.php");
    exit;
}

header("Location: profile.php");
exit;
