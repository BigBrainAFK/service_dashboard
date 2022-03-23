<?php

namespace ServiceApp;

class Util {
	public static function json_response($message = null, $code = 200)
	{
		header_remove();
		http_response_code($code);
		header("Cache-Control: no-transform,public,max-age=300,s-maxage=900");
		header('Content-Type: application/json');
		$status = array(
			200 => '200 OK',
			400 => '400 Bad Request',
			401 => '401 Unauthorized',
			422 => '422 Unprocessable Entity',
			500 => '500 Internal Server Error'
			);
		// ok, validation error, or failure
		header('Status: '.$status[$code]);
		// return the encoded json
		die(json_encode(array(
			'success' => $code < 300, // success or not?
			'description' => $message
		)));
	}

	
	public static function debug_to_console($data) {
		if(is_array($data) || is_object($data)) {
		echo("<script>console.log('PHP: ".json_encode($data)."');</script>");
		} else {
		echo("<script>console.log('PHP: $data');</script>");
		}
	}

	public static function authorize($token) {
		if (!$token) {
			echo $utility->json_response('No token proviced', 401);
			return;
		}
		
		$connection = (new MySQLConnection())->connect();
		
		if ($connection == null) die('Could not establish MySQL connection');
		
		$sql_query = 'SELECT * FROM users WHERE token = :token LIMIT 1';
		
		$prepared = $connection->prepare($sql_query);
		$prepared->execute(array(':token' => $token));
		$user = $prepared->fetch();
		
		if (!$user) {
			echo Util::json_response('Invalid token', 401);
			return;
		}

		if ($user['enabled'] === '0') {
			echo Util::json_response('User disabled', 401);
			return;
		}
		
		return $user;
	}

	/**
	 * Generate a random string, using a cryptographically secure 
	 * pseudorandom number generator (random_int)
	 *
	 * This function uses type hints now (PHP 7+ only), but it was originally
	 * written for PHP 5 as well.
	 * 
	 * For PHP 7, random_int is a PHP core function
	 * For PHP 5.x, depends on https://github.com/paragonie/random_compat
	 * 
	 * @param int $length      How many characters do we want?
	 * @param string $keyspace A string of all possible characters
	 *                         to select from
	 * @return string
	 */
	public static function random_str(
		int $length = 64,
		string $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	): string {
		if ($length < 1) {
			throw new \RangeException("Length must be a positive integer");
		}
		$pieces = [];
		$max = mb_strlen($keyspace, '8bit') - 1;
		for ($i = 0; $i < $length; ++$i) {
			$pieces []= $keyspace[random_int(0, $max)];
		}
		return implode('', $pieces);
	}
}
