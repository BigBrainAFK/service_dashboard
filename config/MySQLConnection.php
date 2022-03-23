<?php

namespace ServiceApp;
 
/**
 * The MySQL connection class
 */
class MySQLConnection {
	/**
	 * A PDO instance
	 * @var type 
	 */
	private $pdo;
 
	/**
	 * return the pdo instance with either null on failure or the new PDO connection
	 * @return \PDO
	 */
	public function connect() {
		if ($this->pdo == null) {
			try {
				$this->pdo = new \PDO('mysql:dbname=' . Config::DATABASENAME . ';host=' . Config::DATABASEHOST . ';charset=utf8', Config::DATABASEUSER, Config::DATABASEPASSWORD);
			 } catch (\PDOException $e) {
				echo $e;
				$this->pdo = null;
			 }
		}
		return $this->pdo;
	}
}