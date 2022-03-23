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

$newtoken = $utility->random_str(64);

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'UPDATE users SET token = :newtoken, timestamp = :time  WHERE token = :token';

$prepared = $connection->prepare($sql_query);
$prepared->execute(array(':token' => $token, ':newtoken' => $newtoken, ':time' => time()));
$rows = $prepared->rowCount();

if (!$rows) {
	echo $utility->json_response('Something went wrong', 500);
	return;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'token' => $newtoken
), JSON_THROW_ON_ERROR);