<?php
	require 'include.php';

	use chillerlan\QRCode\{QRCode, QROptions, QRImageWithLogo};
	use chillerlan\QRCode\Common\EccLevel;
	use chillerlan\QRCode\Data\QRMatrix;
	require_once __DIR__.'/vendor/autoload.php';

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

	function getQR($service) {
		$data = getServiceURL($service);

		$options = new QROptions([
			'version'             => QRCode::VERSION_AUTO,
			'outputType'          => QRCode::OUTPUT_IMAGE_PNG,
			'eccLevel'            => EccLevel::Q,
			'scale'               => 5,
			'imageBase64'         => true,
			'imageTransparent'    => false,
		]);

		$qrcode = new QRCode($options);
		$qrcode->addByteSegment($data);
		//$qrOutputInterface = new QRImageWithLogo($options, $qrcode->getMatrix());
		
		//return $qrOutputInterface->dump(null, __DIR__.'/public/images/logo_small_qr.png');
		return $qrcode->render();
	}

	function getServiceURL($service) {
		$url = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https://' : 'http://' . $_SERVER['SERVER_NAME'] . '/show?service_id=' . $service['service_id'] . '&token=' . $service['token'];

		return urlencode($url);
	}

	function publicURL() {
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
		<script type="text/javascript">
			window.onload = function() {
				if (navigator.userAgent.indexOf("Firefox") === -1) {
					window.print();
				}
			}
		</script>
		<style>
			@page {
				size: A5;
			}

			.layered-image {
				position: relative;
			}

			.layered-image img {
				height: 250;
				width: 250;
			}

			.image-overlay {
				position: absolute;
				top: 34%;
				left: 30%;
				height: 75px;
				width: 100px;
			}

			body {
				line-height: normal !important;
			}

			div#service_quick_info, div#cutout_back {
				display: none;
			}

			img#logo_print {
				display: none;
			}

			@media print {
				@page {
					size: A5;
				}

				html {
					font-size: 20px !important;
				}

				body {
					overflow: visible !important;
					padding-top: 0px !important;
				}

				img#qrcode {
					height: 150px !important;
					width: 150px !important;
				}

				img#logo {
					height: 45px !important;
					width: 60px !important;
				}

				img#logo_print {
					display: inherit;
					align: middle;
					height: 90px !important;
					width: 120px !important;
				}

				span#description_text {
					font-size: 20px;
				}

				table#customer_cutout {
					font-size: 14px;
					margin-top: -8%;
				}

				div.container {
					background-color: none !important;
					border-color: none !important;
					border-radius: none !important;
					border-width: none !important;
					border-style: none !important;
				}

				div#service_info {
					font-size: 22px;
					transform: translate(25px, 15px);
				}

				div#service_quick_info {
					display: inherit;
					transform-origin: center;
					transform: scale(1.75, 1.75) translate(0, 145%) rotate(90deg);
				}

				div#cutout {
					display: inherit;
					backface-visibility: hidden;
					transform-origin: center;
					transform: scale(1.3, 1.3) translate(5%, 50%) rotate(90deg);
				}

				div#cutout_back {
					display: inherit;
					backface-visibility: hidden;
					transform-origin: center;
					transform: scale(1.3, 1.3) translate(10%, 500%) rotate(90deg);
				}
			}
		</style>
	</head>

	<body style="padding-top: 3em;">
		<section class="has-text-centered">
			<div>
				<div class="container" style="background-color: rgba(212, 212, 212, 0.3); border-color: rgba(0, 0, 0, 0); border-radius: 25px; border-width: 15px; border-style: solid;">
					<div id="service_info" style="page-break-inside: avoid; page-break-after: always;">
						<table style="width: 70%;">
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Serviceauftrag:
								</td>
								<td>
									<?php echo $service['service_id']; ?>
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Kundenname:
								</td>
								<td>
									<?php echo $service['name']; ?>
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Telefonnummer:
								</td>
								<td>
									<?php echo $service['phonenumber']; ?>
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Datum:
								</td>
								<td>
									<script>
										document.write(prettyDate(new Date(Number(<?php echo $service['timestamp']; ?>) * 1000)));
									</script>
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Passwort:
								</td>
								<td>
									<?php echo $service['password']; ?>
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Gerätetyp:
								</td>
								<td>
									<?php echo $service['device_type']; ?>
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Fehler:
								</td>
								<td>
									<?php echo $service['category']; ?>
								</td>
							</tr>
						</table>
						<br/>
						<p style="text-align: left;">
							<span style="font-weight: 600;">
								Beschreibung:
							</span>
							<br/>
							<span id="description_text">
								<?php echo nl2br($service['description']); ?>
							</span>
						</p>
					</div>
					<div id="service_quick_info" style="page-break-inside: avoid; page-break-before: always; page-break-after: always;">
						<table style="width: 70%;">
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Serviceauftrag:
								</td>
								<td class="title" style="font-size: 1.5rem; padding-bottom: 20px;">
									<?php echo $service['service_id']; ?>
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Datum:
								</td>
								<td>
									<script>
										document.write(prettyDate(new Date(Number(<?php echo $service['timestamp']; ?>) * 1000)));
									</script>
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Bearbeitet: 
									<span style="font-size: 1.5rem;">
										<?php echo $service['finished'] ? '☑' : '☐'; ?>
									</span>
								</td>
								<td style="font-weight: 600;">
									Ausgehändigt: 
									<span style="font-size: 1.5rem;">
										<?php echo $service['handed_out'] ? '☑' : '☐'; ?>
									</span>
								</td>
							</tr>
							<tr>
								<td>
									&nbsp;
								</td>
							</tr>
							<tr style="page-break-inside: avoid;">
								<td style="font-weight: 600;">
									Angerufen am:
								</td>
							</tr>
						</table>
					</div>
					<div id="cutout" style="page-break-inside: avoid; page-break-before: always; page-break-after: always;">
						<img id="logo_print" src="<?php echo ownURL(); ?>/public/images/logo_small.png"/>
						<br/>
						<table id="customer_cutout">
							<tr>
								<td>
									&nbsp;
								</td>
							</tr>
							<tr>
								<td>
									<span style="font-weight: 600;">
										Serviceauftrag:
									</span>
									<br/>
									<span class="title" style="font-size: 1.5rem;">
										<?php echo $service['service_id']; ?>
									</span>
								</td>
								<td style="width: 10%;">
									&nbsp;
								</td>
								<td rowspan="3">
									<span style="font-weight: 600;">
										QR-Code:
									</span>
									<br/>
									<div class="layered-image">
										<img id="qrcode" class="image-base" width="250" height="250" src="<?php echo getQR($service); ?>" title="Serviceauftrag <?php echo $service['service_id']; ?>" />
										<img id="logo" class="image-overlay" src="<?php echo ownURL(); ?>/public/images/logo_small_qr.png" />
									</div>
								</td>
							</tr>
							<tr>
								<td>
									&nbsp;
								</td>
							</tr>	
							<tr>
								<td>
									<span style="font-weight: 600;">
										<?php echo Config::NAME; ?>
									</span>
									<br/>
									<span>
										<?php echo Config::ADDR_LINE_1; ?>
									</span>
									<br/>
									<span>
										<?php echo Config::ADDR_LINE_2; ?>
									</span>
									<br/>
									<span>
										<?php echo Config::ADDR_LINE_3; ?>
									</span>
									<br/>
									<span>
										<?php echo Config::ADDR_LINE_4; ?>
									</span>
								</td>
								<td>
									&nbsp;
								</td>
							</tr>
						</table>
						<br/>
						<span style="text-align: left; float: left;">
							<span style="font-weight: 600;">
								Link zum Auftrag: 
							</span>
							<br/>
							<span style="font-size: .8rem;">
								<?php echo urldecode(getServiceURL($service)); ?>
							</span>
						</span>
						<br/>
						<br/>
					</div>
					<div id="cutout_back" style="page-break-inside: avoid; page-break-before: always;">
						<span style="text-align: left; float: left;">
							<span style="font-weight: 600;">
								Ohne diesen Beleg keine Herrausgabe des Gerätes!
							</span>
							<br/>
							<br/>
							<span style="font-weight: 200; font-size: 12px;">
								Wir räumen uns das Recht ein, bei einer Lagerung von über 6 Monaten, eine Lagergebühr zu berechnen.
								<br/>
								Sollte das Gerät länger als 12 Monate in einem bearbeitetem Zustand bei uns Lagern, räumen wir uns außerdem das Recht ein, dieses auch fachgerecht zu entsorgen.
							</span>
						</span>
						<br/>
						<br/>
					</div>
				</div>
			</div>
		</section>

	</body>
</html>