<?php

require '../../include.php';

use ServiceApp\Util as Util;

$utility = new Util();

$json = json_decode(file_get_contents("php://input"));

$token = $_SERVER['HTTP_TOKEN'];

if (!$token) {
	echo $utility->json_response('No token provided', 401);
	return;
}

$user = $utility->authorize($token);

header('Content-Type: application/json');
echo json_encode(array(
	'success' => true,
	'token' => $user['token']
), JSON_THROW_ON_ERROR);