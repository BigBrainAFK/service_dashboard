<?php

require '../../include.php';

use ServiceApp\Util as Util;
use ServiceApp\MySQLConnection as MySQLConnection;

$utility = new Util();

$json = json_decode(file_get_contents("php://input"));

$token = $_SERVER['HTTP_TOKEN'];

if (!$token) {
	echo $utility->json_response('No token provided', 401);
	return;
}

$user = $utility->authorize($token);

$password = $json->password;

if (!$password) {
	echo $utility->json_response('No password provided', 401);
	return;
}

if (strlen($password) < 3 || strlen($password) > 64) {
	echo $utility->json_response('Password must have 6-64 characters', 401);
	return;
}

$newpassword = password_hash($password, PASSWORD_BCRYPT);

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'UPDATE users SET password = :newpassword WHERE user_id = :userid';

$prepared = $connection->prepare($sql_query);
$prepared->execute(array(':userid' => $user['user_id'], ':newpassword' => $newpassword));
$rows = $prepared->rowCount();

if (!$rows) {
	echo $utility->json_response('Something went wrong', 500);
	return;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true
), JSON_THROW_ON_ERROR);