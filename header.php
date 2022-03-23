<?php
require_once 'config/config.php';

use ServiceApp\Config as Config;

function ownURL(){
	return sprintf(
		"%s://%s",
		isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https' : 'http',
		$_SERVER['SERVER_NAME']
	);
}

?>

<meta charset="utf-8">
<meta name="description" content="<?php echo Config::SLOGAN; ?>">
<meta name="keywords" content="service,dashboard">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<link rel="apple-touch-icon" sizes="180x180" href="<?php echo ownURL(); ?>/public/images/icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="<?php echo ownURL(); ?>/public/images/icons/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="<?php echo ownURL(); ?>/public/images/icons/favicon-16x16.png" sizes="16x16">
<link rel="manifest" href="<?php echo ownURL(); ?>/public/images/icons/manifest.json">
<link rel="mask-icon" href="<?php echo ownURL(); ?>/public/images/icons/safari-pinned-tab.svg" color="#5bbad5">
<link rel="shortcut icon" href="<?php echo ownURL(); ?>/public/images/icons/favicon.ico">
<meta name="apple-mobile-web-app-title" content="<?php echo Config::SHORTENED_NAME; ?>">
<meta name="application-name" content="<?php echo Config::SHORTENED_NAME; ?>">
<meta name="msapplication-config" content="<?php echo ownURL(); ?>/public/images/icons/browserconfig.xml">

<meta name="theme-color" content="#ffffff">

<meta property="og:url" content="<?php echo ownURL(); ?>" />
<meta property="og:type" content="website" />
<meta property="og:title" content="<?php echo Config::NAME; ?> Service Dashboard" />
<meta property="og:description" content="<?php echo Config::SLOGAN; ?>" />
<meta property="og:image" content="<?php echo ownURL(); ?>/public/images/logo_square.png" />
<meta property="og:image:secure_url" content="<?php echo ownURL(); ?>/public/images/logo_square.png" />

<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="<?php echo Config::NAME; ?> Service Dashboard">
<meta name="twitter:description" content="<?php echo Config::SLOGAN; ?>">
<meta name="twitter:image" content="<?php echo ownURL(); ?>/public/images/logo_square.png">
<meta name="twitter:image:src" content="<?php echo ownURL(); ?>/public/images/logo_square.png">

<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.8.0/css/bulma.min.css">
<link rel="stylesheet" type="text/css" href="public/css/style.css">
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/sweetalert2@9/dist/sweetalert2.min.css">
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/sweetalert2@9/dist/sweetalert2.min.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.15.3/axios.min.js"></script>
<script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
<script type="text/javascript">
	axios.defaults.validateStatus = function () {
		return true;
	};
</script>