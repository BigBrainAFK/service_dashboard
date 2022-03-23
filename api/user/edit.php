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
$username = $json->username;
$realname = $json->realname;
$admin = $json->admin;
$enabled = $json->enabled;

if (!$user_id) {
	echo $utility->json_response('No user id provided', 400);
	return;
}

if (!$username) {
	echo $utility->json_response('No username provided', 400);
	return;
}

if (!$realname) {
	echo $utility->json_response('No realname provided', 400);
	return;
}

if (!$admin) {
	$admin = false;
}

if (!$enabled) {
	$enabled = false;
}

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'UPDATE users
	SET username = :username, realname = :realname, admin = :admin, enabled = :enabled, timestamp = :timestamp
	WHERE user_id = :user_id';

$prepared = $connection->prepare($sql_query);
$prepared->execute(array(
	':user_id' => $user_id,
	':username' => $username,
	':realname' => $realname,
	':admin' => $admin,
	':enabled' => $enabled,
	':timestamp' => time()
));
$result = $prepared->rowCount();

if (!$result) {
	header('Content-Type: application/json');
	echo json_encode(array(
		'success' => false,
		'description' => $prepared->queryString
	), JSON_THROW_ON_ERROR);
	return;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true
), JSON_THROW_ON_ERROR);
