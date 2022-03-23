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

$name = $json->name;
$phonenumber = $json->phonenumber;
$password = $json->password;
$description = $json->description;
$device_type = $json->device_type;
$category = $json->category;
$timenow = time();

if (!$name) {
	echo $utility->json_response('No name provided', 400);
	return;
}

if (!$phonenumber) {
	echo $utility->json_response('No phonenumber provided', 400);
	return;
}

if (!$password) {
	$password = '';
}

if (!$description) {
	echo $utility->json_response('No description provided', 400);
	return;
}

if (!$device_type) {
	echo $utility->json_response('No device_type provided', 400);
	return;
}

if (!$category) {
	echo $utility->json_response('No category provided', 400);
	return;
}

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'INSERT INTO services (creator_id, name, phonenumber, password, description, device_type, category, token, timestamp, edited_at)
	VALUES (:creator_id, :name, :phonenumber, :password, :description, :device_type, :category, :token, :timestamp, :edited_at)';

$prepared = $connection->prepare($sql_query);
$result = $prepared->execute(array(
	':name' => $name,
	':phonenumber' => $phonenumber,
	':description' => $description,
	':password' => $password,
	':creator_id' => $user['user_id'],
	':device_type' => $device_type,
	':category' => $category,
	':token' => $utility->random_str(16),
	':timestamp' => $timenow,
	':edited_at' => $timenow
));

if (!$result) {
	echo $utility->json_response('Could not create service', 500);
	return;
}

$sql_query = 'SELECT * FROM services ORDER BY service_id DESC LIMIT 1';

$prepared = $connection->prepare($sql_query);
$prepared->execute();
$service = $prepared->fetch();

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'service' => $service
), JSON_THROW_ON_ERROR);
