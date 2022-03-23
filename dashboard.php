<!DOCTYPE html>
<html style="font-size: 17px;">
	<head>

		<?php
			include './header.php';

			use ServiceApp\Config as Config;
		?>

		<title><?php echo Config::NAME; ?> Service Dashboard</title>
		<script type="text/javascript" src="public/js/dashboard.js"></script>
	</head>
	<body>
		<section id='auth' class="hero is-light is-fullheight">
			<div class="hero-body">
				<div class="container is-fluid">
					<h1 class="title is-size-3 has-text-weight-light">
						Mitarbeiter Dashbboard
					</h1>
					<h2 class="subtitle">
						<p class="control has-addons">
							<input id='token' class="input is-danger" type="text" placeholder="Your admin token">
							<a id='tokenSubmit' class="button is-danger is-outlined">Check</a>
						</p>
					</h2>
				</div>
			</div>
		</section>

		<section id='dashboard' class="section">
			<div id="panel" class="container is-fluid">
				<div class="level">
					<h1 class="title is-size-3 has-text-weight-light level-left">
						Mitarbeiter Dashboard
					</h1>
					<div class="level-right">
						<div>
							<div class="level-item has-text-right"><div id="stat_total"></div>&nbsp;Gesamt</div>
							<br/>
							<div class="level-item has-text-right"><div id="stat_finished"></div>&nbsp;Bearbeitet&nbsp;|&nbsp;<div id="stat_handed_out"></div>&nbsp;Ausgehändigt&nbsp;|&nbsp;<div id="stat_paid"></div>&nbsp;Berechnet</div>
						</div>
					</div>
				</div>
				<hr>
				<div class="columns">
					<div class="column is-3 is-size-5 has-text-weight-light">
						<aside class="menu" id="menu">
							<p class="menu-label">General</p>
							<ul class="menu-list">
								<li><a href="/">Hompeage</a></li>
								<li><a id="itemDashboard" onclick="panel.clearDashboard()">Dashboard</a></li>
							</ul>
							<p class="menu-label">Service</p>
							<ul class="menu-list">
								<li><a id="itemServices" onclick="panel.listService()">Serviceaufträge</a></li>
								<li><a id="itemCreate" onclick="panel.createService()">Neuer Serviceauftrag</a></li>
							</ul>
							<div id='userManagement'>
								<p class="menu-label">Users</p>
								<ul class="menu-list">
									<li><a id="itemUsers" onclick="panel.listUser()">Manage</a></li>
									<li><a id="itemCreateUser" onclick="panel.createUser()">Neuen Benutzer anlegen</a></li>
								</ul>
							</div>
							<p class="menu-label">Einstellungen</p>
							<ul class="menu-list">
								<li><a id="itemTokens" onclick="panel.changeToken()">Token &auml;ndern</a></li>
								<li><a id="itemPassword" onclick="panel.changePassword()">Passwort &auml;ndern</a></li>
								<li><a id="itemLogout"onclick="panel.logout()">Logout</a></li>
							</ul>
							<span id="clientDownload">
								<p class="menu-label" style="margin-top: 1em;">Download</p>
								<ul class="menu-list">
									<li><a id="itemDownload" href="/public/setup.exe">Client Download</a></li>
								</ul>
							</span>
						</aside>
					</div>
					<div class="column has-text-centered" id='page'>
						<img src="public/images/logo_small.png" width="60%" height="50%">
					</div>
				</div>
			</div>
		</section>
	</body>
</html>