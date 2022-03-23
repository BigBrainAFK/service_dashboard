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

$search = $json->search ?? null;
$view = $json->view ?? null;

if ($view == "unfinished") {
	$view = "WHERE finished = 0";
} elseif ($view == "unpaid") {
	$view = "WHERE paid = 0";
} elseif ($view == "undelivered") {
	$view = "WHERE handed_out = 0";
} else {
	$view = "WHERE service_id <> ''";
}

$page = $_GET['page'];

if (!$page) $page = 0;

$offset = $page * 25;

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

if ($search) {
	$sql_query = 'SELECT count(*) FROM services ' . $view . ' AND ' . $search->type . ' LIKE :search';
} else {
	$sql_query = 'SELECT count(*) FROM services ' . $view;
}

$prepared = $connection->prepare($sql_query);
if ($search) {
	$prepared->execute(array(
		':search' => '%' . $search->query . '%'
	));
} else {
	$prepared->execute();
}
$totalCount = $prepared->fetchColumn(0);

if ($search) {
	$sql_query = 'SELECT * FROM services ' . $view . ' AND ' . $search->type . ' LIKE :search ORDER BY service_id DESC LIMIT ' . $offset . ', 25';
} else {
	$sql_query = 'SELECT * FROM services ' . $view . ' ORDER BY service_id DESC LIMIT ' . $offset . ', 25';
}

$prepared = $connection->prepare($sql_query);
if ($search) {
	$prepared->execute(array(
		':search' => '%' . $search->query . '%'
	));
} else {
	$prepared->execute();
}
$service_result = $prepared->fetchAll(\PDO::FETCH_ASSOC);
$count = $prepared->rowCount();
$errInfo = $prepared->errorInfo();

if (!count($service_result) && $errInfo[0] !== '00000' && intval($totalCount) > 0) {
	echo $utility->json_response('Couldnt fetch services', 500);
	return;
}

$sql_query = 'SELECT user_id, username, realname FROM users';

$prepared = $connection->prepare($sql_query);
$prepared->execute();
$user_result = $prepared->fetchAll(\PDO::FETCH_ASSOC);

if (!$user_result) {
	echo $utility->json_response('Couldnt fetch users', 500);
	return;
}

$result = array();

foreach ($service_result as $service) {
	$temp = array();

	foreach ($user_result as $current_user) {
		if ($service['creator_id'] == $current_user['user_id']) {
			$creator = array('creator' => $current_user);
			$temp = $temp + $creator;
		}

		if ($service['assigned_user_id'] == $current_user['user_id']) {
			$assigned = array('assigned_user' => $current_user);
			$temp = $temp + $assigned;
		}
	}

	$temp = $service + $temp;
	array_push($result, $temp);
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'services' => $result,
	'count' => $count,
	'totalCount' => $totalCount,
	'search' => $json
), JSON_THROW_ON_ERROR);
