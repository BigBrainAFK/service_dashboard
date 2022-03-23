<?php

	require 'include.php';

	use ServiceApp\Util as Util;
	use ServiceApp\MySQLConnection as MySQLConnection;
	use ServiceApp\Config as Config;

	$utility = new Util();

	$json = json_decode(file_get_contents("php://input"));

	$token = $_GET['token'];

	$service_id = $_GET['service_id'];

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

	if (!$token == $service['token']) {
		echo $utility->json_response('Invalid token', 401);
		return;
	}

	function publicURL(){
		return sprintf(
			"%s://%s",
			isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https' : 'http',
			$_SERVER['SERVER_NAME']
		);
	}

?>

<!DOCTYPE html>
<html style="font-size: 22px;">
	<head>

		<?php include 'header.php'; ?>

		<title><?php echo Config::NAME; ?> Service</title>
		<script type="text/javascript" src="public/js/home.js"></script>
	</head>

	<body>
		<section class="hero has-text-centered" id="home">
			<div class="hero-body">
				<div class="container" style="background-color: rgba(212, 212, 212, 0.3); border-color: rgba(0, 0, 0, 0); border-radius: 25px; border-width: 15px; border-style: solid;">
					<table style="width: 70%;">
						<tr>
							<th></th>
							<th></th>
						</tr>
						<tr>
							<td style="font-weight: 600;">
								Serviceauftrag:
							</td>
							<td>
								<?php echo $service['service_id']; ?>
							</td>
						</tr>
						<tr>
							<td style="font-weight: 600;">
								Kundenname:
							</td>
							<td>
								<?php echo $service['name']; ?>
							</td>
						</tr>
						<tr>
							<td style="font-weight: 600;">
								Telefonnummer:
							</td>
							<td>
								<?php echo $service['phonenumber']; ?>
							</td>
						</tr>
						<tr>
							<td style="font-weight: 600;">
								Datum:
							</td>
							<td>
								<script>
									document.write(prettyDate(new Date(Number(<?php echo $service['timestamp']; ?>) * 1000)));
								</script>
							</td>
						</tr>
						<tr>
							<td style="font-weight: 600;">
								Passwort:
							</td>
							<td>
								<?php echo $service['password']; ?>
							</td>
						</tr>
						<tr>
							<td style="font-weight: 600;">
								Gerätetyp:
							</td>
							<td>
								<?php echo $service['device_type']; ?>
							</td>
						</tr>
						<tr>
							<td style="font-weight: 600;">
								Fehler:
							</td>
							<td>
								<?php echo $service['category']; ?>
							</td>
						</tr>
						<tr>
							<td style="font-weight: 600;">
								<?php echo $service['finished'] ? 'Bearbeitung abgeschlossen' : 'In Bearbeitung'; ?>
							</td>
							<td style="font-weight: 600;">
								Ausgehändigt: <?php echo $service['handed_out'] ? '✔' : '✘'; ?>
							</td>
						</tr>
					</table>
					<br/>
					<p style="text-align: left;">
						<span style="font-weight: 600;">
							Beschreibung:
						</span>
						<br/>
						<span>
							<?php echo nl2br($service['description']); ?>
						</span>
					</p>
					<br/>
					<p style="text-align: left;">
						<span style="font-weight: 600;">
							Reparaturbericht:
						</span>
						<br/>
						<span>
							<?php echo nl2br($service['finished_report']); ?>
						</span>
					</p>
				</div>
			</div>
		</section>

	</body>
</html>