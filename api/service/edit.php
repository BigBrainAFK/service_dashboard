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
$name = $json->name;
$phonenumber = $json->phonenumber;
$password = $json->password;
$description = $json->description;
$device_type = $json->device_type;
$category = $json->category;
$finished_report = $json->finished_report;
$worker_note = $json->worker_note;
$finished = $json->finished;
$paid = $json->paid;
$handed_out = $json->handed_out;
$assigned_user = $json->assigned_user;
$timenow = time();

if (!$service_id) {
	echo $utility->json_response('No service id provided', 400);
	return;
}

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

if (!$finished_report) {
	$finished_report = "";
}

if (!$worker_note) {
	$worker_note = "";
}

if (!$finished) {
	$finished = false;
}

if (!$paid) {
	$paid = false;
}

if (!$handed_out) {
	$handed_out = false;
}

if (!$assigned_user) {
	$assigned_user = null;
}

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'UPDATE services
	SET assigned_user_id = :assigned_user_id, name = :name, phonenumber = :phonenumber, password = :password, description = :description, device_type = :device_type, category = :category, finished_report = :finished_report, worker_note = :worker_note, handed_out = :handed_out, finished = :finished, paid = :paid, edited_at = :edited_at
	WHERE service_id = :service_id';

$prepared = $connection->prepare($sql_query);
$prepared->execute(array(
	':service_id' => $service_id,
	':assigned_user_id' => $assigned_user,
	':name' => $name,
	':phonenumber' => $phonenumber,
	':password' => $password,
	':description' => $description,
	':device_type' => $device_type,
	':category' => $category,
	':finished_report' => $finished_report,
	':worker_note' => $worker_note,
	':handed_out' => $handed_out,
	':finished' => $finished,
	':paid' => $paid,
	':edited_at' => $timenow
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
