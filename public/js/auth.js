/* eslint-env browser */
var page = {};

page.login = function(){

	var user = document.getElementById('user').value;
	var pass = document.getElementById('pass').value;

	if(user === undefined || user === null || user === '')
		return swal.fire('Error', 'You need to specify a username', 'error');
	if(pass === undefined || pass === null || pass === '')
		return swal.fire('Error', 'You need to specify a username', 'error');

	axios.post('/api/login', {
		username: user.toLowerCase(),
		password: pass
	})
	.then(function (response) {
		if(response.data.success === false || !response.data.token)
			return swal.fire('Error', response.data.description, 'error');
		
		localStorage.token = response.data.token;
		window.location = '/dashboard';

	})
	.catch(function (error) {
		console.log(error);
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});
};

page.verify = function(reloadOnError = false){
	page.token = localStorage.token;

	document.getElementById('user').value = localStorage.lastUser || '';

	if(page.token === undefined) return;

	axios.post('/api/tokens/verify', {
		token: page.token
	})
	.then(function (response) {
		if (response.data.success === false) {
			// eslint-disable-next-line no-undef
			swal.fire({
				title: 'An error ocurred',
				text: response.data.description,
				icon: 'error'
			}).then(() => {
				if (reloadOnError) {
					localStorage.removeItem('token');
					location.reload();
				}
			});
			return;
		}
		
		window.location = '/dashboard';
	})
	.catch(function (error) {
		console.log(error);
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});

};

window.onload = function () {
	page.verify(true);
};

window.onkeydown = function(event) {
	if (event.code === 'Enter' || event.code === 'NumpadEnter') {
		if (swal.isVisible()) {
			swal.close();
			return;
		}

		page.login();
	}
}
