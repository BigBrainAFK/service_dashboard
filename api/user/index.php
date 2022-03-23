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

$page = $_GET['page'];

if (!$page) $page = 0;

$offset = $page * 25;

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'SELECT count(*) FROM users';

$prepared = $connection->prepare($sql_query);
$prepared->execute();
$count = $prepared->fetchColumn(0);

$sql_query = 'SELECT user_id, username, realname, token, admin, enabled, timestamp FROM users';

$prepared = $connection->prepare($sql_query);
$prepared->execute();
$result = $prepared->fetchAll(\PDO::FETCH_ASSOC);

if (!count($result) && count($result) != intval($count)) {
	echo $utility->json_response('Couldnt fetch users', 500);
	return;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'users' => $result,
	'count' => $count
), JSON_THROW_ON_ERROR);
