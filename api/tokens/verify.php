<?php

require '../../include.php';

use ServiceApp\Util as Util;
use ServiceApp\MySQLConnection as MySQLConnection;

$utility = new Util();

$json = json_decode(file_get_contents("php://input"));

$token = $json->token;

if (!$token) {
	echo $utility->json_response('No token provided', 401);
	return;
}

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'SELECT user_id, username, realname, admin, enabled FROM users WHERE token = :token LIMIT 1';

$prepared = $connection->prepare($sql_query);
$prepared->execute(array(':token' => $token));
$user = $prepared->fetch();

if (!$user) {
	echo $utility->json_response('Invalid token', 401);
	return;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'user_id' => $user['user_id'],
	'username' => $user['username'],
	'realname' => $user['realname'],
	'admin' => $user['admin'],
	'enabled' => $user['enabled']
), JSON_THROW_ON_ERROR);