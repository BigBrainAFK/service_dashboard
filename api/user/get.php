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

$user_id = $json->user_id;

if (!$user_id) {
	echo $utility->json_response('No service id provided', 401);
	return;
}

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'SELECT user_id, username, realname, enabled, admin FROM users WHERE user_id = :user_id';

$prepared = $connection->prepare($sql_query);
$prepared->execute(array(
	':user_id' => $user_id
));
$result = $prepared->fetch(\PDO::FETCH_ASSOC);

if (!$result) {
	echo $utility->json_response('Couldnt fetch user', 500);
	return;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'user' => $result
), JSON_THROW_ON_ERROR);
