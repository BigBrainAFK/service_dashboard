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

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

$sql_query = 'SELECT SUM(finished = 1) AS count_finished, SUM(handed_out = 1) AS count_handed_out, SUM(paid = 1) AS count_paid, count(*) AS count_total FROM services';
$prepared = $connection->prepare($sql_query);
$prepared->execute();
$result = $prepared->fetchAll(\PDO::FETCH_ASSOC);
$errInfo = $prepared->errorInfo();

if (!count($result) && $errInfo[0] !== '00000') {
	echo $utility->json_response('Couldnt fetch services', 500);
	return;
}

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'stat_result' => $result,
	'search' => $json
), JSON_THROW_ON_ERROR);
