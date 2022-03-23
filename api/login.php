<?php

require '../include.php';

use ServiceApp\Util as Util;
use ServiceApp\MySQLConnection as MySQLConnection;

$utility = new Util();

$json = json_decode(file_get_contents("php://input"));

$username = $json->username;
$password = $json->password;

if (!$username) {
	echo $utility->json_response('No username provided', 400);
	return;
}

if (!$password) {
	echo $utility->json_response('No password provided', 400);
	return;
}

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'SELECT * FROM users WHERE username = :username LIMIT 1';

$prepared = $connection->prepare($sql_query);
$prepared->execute(array(':username' => $username));
$user = $prepared->fetch();

if (!$user) {
	echo $utility->json_response('Username doesn\'t exist', 401);
	return;
}

if ($user['enabled'] == 0) {
	echo $utility->json_response('This account has been disabled', 401);
	return;
};

if (!password_verify($password, $user['password'])) {
	echo $utility->json_response('Wrong password', 401);
	return;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' =>true,
	'token' => $user['token']
), JSON_THROW_ON_ERROR);