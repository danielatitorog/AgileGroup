<?php
session_start();

require_once('Models/UserDataSet.php');
require_once('Models/UserAuthentication.php');

//Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    die("You must be logged in to view this page.");
}

$userId = $_SESSION['user_id'];

//Build $view object
$view = new stdClass();
$view->user = new User();
$view->user->isLoggedIn = true;
$view->user->username = $_SESSION['username'];   //NO MORE NULL

//Database connection
$db = Database::getInstance()->getdbConnection();

//DELETE friend logic
if (isset($_GET['delete'])) {
    $friendId = intval($_GET['delete']);

    $query = $db->prepare("DELETE FROM friends WHERE id = ? AND user_id = ?");
    $query->execute([$friendId, $userId]);

    header("Location: addfriends.php");
    exit();
}
//ADD friend logic
if ($_SERVER['REQUEST_METHOD'] === "POST") {

    if (!empty($_POST['friend_username'])) {
        $friend = trim($_POST['friend_username']);

        $query = $db->prepare("INSERT INTO friends (user_id, friend_username) VALUES (?, ?)");
        $query->execute([$userId, $friend]);
    }

    header("Location: addfriends.php");
    exit();
}
//LOAD friend list
$query = $db->prepare("SELECT id, friend_username FROM friends WHERE user_id = ?");
$query->execute([$userId]);
$view->friends = $query->fetchAll(PDO::FETCH_ASSOC);

//Load view
require_once('Views/addfriends.phtml');
