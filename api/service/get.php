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

$service_id = $json->service_id;

if (!$service_id) {
	echo $utility->json_response('No service id provided', 401);
	return;
}

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'SELECT * FROM services WHERE service_id = :service_id LIMIT 1';

$prepared = $connection->prepare($sql_query);
$prepared->execute(array(':service_id' => $service_id));
$service = $prepared->fetch(\PDO::FETCH_ASSOC);

if (!$service) {
	echo $utility->json_response('Couldnt fetch service', 500);
	return;
}

$sql_query = 'SELECT user_id, username, realname, enabled, admin FROM users';

$prepared = $connection->prepare($sql_query);
$prepared->execute();
$user_result = $prepared->fetchAll(\PDO::FETCH_ASSOC);

if (!$user_result) {
	echo $utility->json_response('Couldnt fetch users', 500);
	return;
}

foreach ($user_result as $current_user) {
	$temp = array();

	if ($service['creator_id'] == $current_user['user_id']) {
		$creator = array('creator' => $current_user);
		$temp = $temp + $creator;
	}

	if ($service['assigned_user_id'] == $current_user['user_id']) {
		$assigned = array('assigned_user' => $current_user);
		$temp = $temp + $assigned;
	}

	$service = $service + $temp;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'service' => $service,
	'users' => $user_result
), JSON_THROW_ON_ERROR);
