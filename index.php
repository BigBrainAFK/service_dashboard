<!DOCTYPE html>
<html style="font-size: 20px;">
	<head>

		<?php
			include 'header.php';
			
			use ServiceApp\Config as Config;
		?>

		<title><?php echo Config::NAME; ?></title>
	</head>

	<body>
		<section class="hero is-fullheight has-text-centered" id="home">
			<div class="hero-body">
				<div class="container if-fluid">
					<p id="b">
						<img class="logo" src="public/images/logo_small.png">
					</p>
					<h1 class="title"><?php echo Config::NAME; ?></h1>

					<h3 id="links">
						<a href="/auth" class="is-danger">Dashboard</a>
					</h3>

				</div>
			</div>
		</section>

	</body>
</html>
