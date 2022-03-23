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

if ($user['admin'] == '0') {
	echo $utility->json_response('No permission', 400);
	return;
}

$username = $json->username;
$realname = $json->name;
$password = $json->password;

if (!$username) {
	echo $utility->json_response('No username provided', 400);
	return;
}

if (!$realname) {
	echo $utility->json_response('No realname provided', 400);
	return;
}

if (!$password) {
	echo $utility->json_response('No password provided', 400);
	return;
}

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'INSERT INTO users (username, realname, password, token, admin, enabled, timestamp)
	VALUES (:username, :realname, :password, :token, :admin, :enabled, :timestamp)';

$prepared = $connection->prepare($sql_query);
$result = $prepared->execute(array(
	':username' => $username,
	':realname' => $realname,
	':password' => password_hash($password, PASSWORD_BCRYPT),
	':token' => $utility->random_str(64),
	':admin' => false,
	':enabled' => true,
	':timestamp' => time(),
));

if (!$result) {
	echo $utility->json_response('Could not create service', 500);
	return;
}

$sql_query = 'SELECT user_id, username FROM users ORDER BY user_id DESC LIMIT 1';

$prepared = $connection->prepare($sql_query);
$prepared->execute();
$user = $prepared->fetch();

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'user' => $user
), JSON_THROW_ON_ERROR);
