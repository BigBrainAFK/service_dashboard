<?php
 
namespace ServiceApp;
 
/**
 * Class to create our tables
 */
class MySQLCreateTable {
 
	/**
	 * PDO instance
	 * @var \PDO
	 */
	private $pdo;
 
	/**
	 * Set the PDO object to a PDO instance
	 */
	public function __construct($pdo) {
		$this->pdo = $pdo;
	}
 
	/**
	 * Create the tables
	 */
	public function createTables() {
		$commands = ['CREATE TABLE IF NOT EXISTS users (
				user_id INTEGER AUTO_INCREMENT PRIMARY KEY,
				username VARCHAR(64) NOT NULL UNIQUE,
				realname VARCHAR(128) NOT NULL,
				password TEXT NOT NULL,
				token VARCHAR(64) NOT NULL UNIQUE,
				admin BOOLEAN NOT NULL DEFAULT 0,
				enabled BOOLEAN NOT NULL DEFAULT 0,
				timestamp TEXT NOT NULL
			)',
			'CREATE TABLE IF NOT EXISTS services (
				service_id INTEGER AUTO_INCREMENT PRIMARY KEY,
				creator_id INTEGER NOT NULL,
				assigned_user_id INTEGER,
				name TEXT NOT NULL,
				phonenumber TEXT NOT NULL,
				password TEXT NOT NULL,
				description TEXT NOT NULL,
				device_type TEXT NOT NULL,
				category TEXT NOT NULL,
				finished_report TEXT,
				worker_note TEXT,
				token VARCHAR(64) UNIQUE,
				handed_out BOOLEAN NOT NULL DEFAULT 0,
				finished BOOLEAN NOT NULL DEFAULT 0,
				timestamp TEXT NOT NULL,
				edited_at TEXT NOT NULL,
				FOREIGN KEY (creator_id)
				   	REFERENCES users(user_id),
				FOREIGN KEY (assigned_user_id)
					REFERENCES users(user_id)
			)'];
		foreach ($commands as $command) {
			$this->pdo->exec($command);
			print_r($this->pdo->errorInfo());
		}

		$sql_query = 'INSERT INTO users (user_id, username, realname, password, token, admin, enabled, timestamp)
			VALUES (:userid, :username, :realname, :password, :token, :admin, :enabled, :timestamp)';

		$prepared = $this->pdo->prepare($sql_query);
		$prepared->execute(array(
			':userid' => 1,
			':username' => 'root',
			':realname' => 'root',
			'password' => password_hash('root', PASSWORD_BCRYPT),
			':token' => Util::random_str(64),
			':admin' => true,
			':enabled' => true,
			':timestamp' => time()
		));
		$count = $prepared->rowCount(\PDO::FETCH_ASSOC);

		return $count;
	}
}