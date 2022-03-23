<!DOCTYPE html>
<html>
	<head>

		<?php
			include 'header.php';

			use ServiceApp\Config as Config;
		?>

		<title><?php echo Config::NAME; ?> Service Dashboard</title>
		<script type="text/javascript" src="public/js/auth.js"></script>
	</head>
	<body>

		<style type="text/css">
			section#login {
				background-color: #f5f6f8;
			}
		</style>

		<section id='login' class="hero is-fullheight">
			<div class="hero-body">
				<div class="container">
					<h1 class="title">
						Dashboard Zugang
					</h1>
					<h2 class="subtitle">
						Login
					</h2>
					<div class="columns">
						<div class="column">
							<div class="field">
								<div class="control">
									<input id='user' class="input" type="text" placeholder="Benutzername">
								</div>
							</div>
							<div class="field">
								<div class="control">
									<input id='pass' class="input" type="password" placeholder="Passwort">
								</div>
							</div>

							<p class="control has-addons is-pulled-right">
								<a class="button" id='loginBtn' onclick="page.login()">
									<span>Log in</span>
								</a>
							</p>

						</div>
						<div class="column is-hidden-mobile"></div>
						<div class="column is-hidden-mobile"></div>
					</div>
				</div>
			</div>
		</section>

	</body>
</html>
