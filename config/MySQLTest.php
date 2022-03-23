<?php

require '../include.php';

use ServiceApp\Util as Util;
use ServiceApp\MySQLConnection as MySQLConnection;

$connection = (new MySQLConnection())->connect();

if ($connection == null) die('Could not establish MySQL connection');

echo 'Ok!';

?>