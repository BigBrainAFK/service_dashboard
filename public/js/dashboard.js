/* eslint-env browser */
const panel = {};

panel.page;
panel.username;
panel.realname;
panel.userid;
panel.token = localStorage.token;
panel.serviceView = localStorage.serviceView || 'all';
panel.dataView = localStorage.dataView || 'show';
panel.timer;
panel.statTimeout;

panel.preparePage = function() {
	if (!panel.token) return window.location = '/auth';
	panel.verifyToken(panel.token, true);
	panel.inactivityTime();
};

panel.verifyToken = function(token, reloadOnError) {
	if (reloadOnError === undefined) reloadOnError = false;

	// eslint-disable-next-line no-undef
	axios.post('/api/tokens/verify', {
		token: token
	})
		.then(response => {
			if (response.data.success === false) {
				// eslint-disable-next-line no-undef
				swal.fire({
					title: 'An error ocurred',
					text: response.data.description,
					icon: 'error'
				}).then(() => {
					if (reloadOnError) {
						localStorage.removeItem('token');
						localStorage.removeItem('lastUser');
						window.location = '/auth';
					}
				});
				return;
			}

			// eslint-disable-next-line dot-notation,no-undef
			axios.defaults.headers.common['token'] = token;
			localStorage.token = token;
			panel.token = token;
			panel.user_id = Number(response.data.user_id);
			panel.username = localStorage.lastUser = response.data.username;
			panel.realname = response.data.realname;
			panel.admin = response.data.admin;

			if (!response.data.enabled) return window.location = '/auth';

			return panel.prepareDashboard();
		})
		.catch(error => {
			console.log(error);
			// eslint-disable-next-line no-undef
			return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
		});
};

panel.prepareDashboard = function() {
	if (window.navigator.userAgent === 'Service-Client 1.0.1')
		document.getElementById('clientDownload').style.display = 'none';
	else if (window.navigator.userAgent.startsWith('Service-Client'))
		document.getElementById('itemDownload').innerText = 'Download Update';

	panel.page = document.getElementById('page');
	document.getElementById('auth').style.display = 'none';
	document.getElementById('dashboard').style.display = 'block';

	if (!window.location.hash.startsWith('#listService-')) {
		window.clearInterval(panel.timer);
		panel.timer = undefined;
	}

	if (!panel.admin) {
		document.getElementById('userManagement').style.display = 'none';
	} else {
		document.getElementById('itemUsers').addEventListener('click', function() {
			if (!window.location.hash.startsWith('#listUser-')) window.location.hash = 'listUser-0';
			panel.setActiveMenu(this);
		});
	
		document.getElementById('itemCreateUser').addEventListener('click', function() {
			if (window.location.hash !== '#createUser') window.location.hash = 'createUser';
			panel.setActiveMenu(this);
		});
	}

	document.getElementById('itemDashboard').addEventListener('click', function() {
		if (window.location.hash.length > 1) window.location.hash = '';
		panel.setActiveMenu(this);
	});

	document.getElementById('itemServices').addEventListener('click', function() {
		if (!window.location.hash.startsWith('#listService-')) window.location.hash = 'listService-0';
		panel.setActiveMenu(this);
	});

	document.getElementById('itemCreate').addEventListener('click', function() {
		if (window.location.hash !== '#createService') window.location.hash = 'createService';
		panel.setActiveMenu(this);
	});

	document.getElementById('itemTokens').addEventListener('click', function() {
		if (window.location.hash !== '#changeToken') window.location.hash = 'changeToken';
		panel.setActiveMenu(this);
	});

	document.getElementById('itemPassword').addEventListener('click', function() {
		if (window.location.hash !== '#changePassword') window.location.hash = 'changePassword';
		panel.setActiveMenu(this);
	});

	document.getElementById('itemLogout').innerHTML = `Logout ( ${panel.realname} )`;

	const hashtag = window.location.hash.slice(1);

	if (hashtag) {
		if (hashtag.includes('-')) {
			const hashsplit = hashtag.split('-');
			if (panel.hasOwnProperty(hashsplit[0])) panel[hashsplit[0]](hashsplit[1]); 
		} else {
			if (panel.hasOwnProperty(hashtag)) {
				panel[hashtag]();
			} else {
				window.location.hash = '';
			}
		}
	}
	
	panel.setMenu();
	
	panel.updateStats();
};

panel.setMenu = function() {
	const match = [
		['itemUsers', 'listUser'],
		['itemUsers', 'editUser'],
		['itemCreateUser', 'createUser'],
		['itemServices', 'listService'],
		['itemServices', 'editService'],
		['itemCreate', 'createService'],
		['itemTokens', 'changeToken'],
		['itemPassword', 'changePassword'],
		['itemDashboard', '']
	];

	let target = match.filter(e => {
		return window.location.hash.startsWith(`#${e[1]}`)
	});

	if (target.length === 0) target = 'itemDashboard';
	else target = target[0][0];

	panel.setActiveMenu(document.getElementById(target));
};

panel.logout = function() {
	localStorage.removeItem('token');
	location.reload('/');
};

panel.clearDashboard = function() {
	panel.page.innerHTML = '<img src="public/images/logo_small.png" width="60%" height="50%">';
};

panel.listUser = function(page = undefined) {
	if (!panel.admin) return window.location = '/dashboard';

	if (page === undefined) page = 0;

	page = Number(page);

	window.location.hash = `listUser-${page}`;

	const url = `/api/user?page=${page}`;

	// eslint-disable-next-line no-undef
	axios.get(url).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-else-return,no-undef
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		let prevPage = 0;
		let nextPage = page + 1;

		if (response.data.users.length < 25) nextPage = page;

		if (page > 0) prevPage = page - 1;

		panel.page.innerHTML = '';
		const container = document.createElement('div');
		const maxpages = Math.ceil(Number(response.data.count) / 25);

		const pagelist = document.createElement('ul');
		pagelist.classList.add('pagination-list');

		let dotted = false;
		
		for (let i = 1; i <= maxpages; i++) {
			const item = document.createElement('li');

			if (page + 1 === i) {
				if (dotted) dotted = false;

				item.innerHTML = `
					<a class='pagination-link is-current'>${i}</a>
				`;
			} else {
				const distance = Math.abs(page + 1 - i);
	
				if (distance >= 2) {
					if (i === 1 || i === maxpages) {
						item.innerHTML = `
							<a class='pagination-link' onclick='panel.listUser(${i - 1})'>${i}</a>
						`;
					} else {
						if (!dotted) {
							item.innerHTML = `
								<a class='pagination-ellipsis'>&hellip;</a>
							`;
							dotted = true;
						}
					}
				} else {
					item.innerHTML = `
						<a class='pagination-link' onclick='panel.listUser(${i - 1})'>${i}</a>
					`;
				}
			}

			pagelist.appendChild(item);
		}

		const pagination = `
			<nav class='pagination is-centered'>
				<a class='pagination-previous' onclick='panel.listUser(${prevPage})'>Vorherige Seite</a>
				<a class='pagination-next' onclick='panel.listUser(${nextPage})'>Nächste Seite</a>

				${pagelist.outerHTML}
			</nav>`;
		container.innerHTML = `
			${pagination}
			<hr>
			<table class='table is-striped is-narrow is-left is-fullwidth'>
				<thead>
					<tr>
							<th>	
								<span class='icon' style="font-size: 1.25rem;" title='Freigeschaltet'>
									<i class='fas fa-key has-text-warning'></i>
								</span>
							</th>
							<th>	
								<span class='icon' style="font-size: 1.25rem;" title='Admin'>
									<i class='fas fa-bolt has-text-warning'></i>
								</span>
							</th>
							<th>User ID</th>
							<th>Benutzername</th>
							<th>Name</th>
							<th>Token</th>
							<th>Datum</th>
							<th></th>
							<th></th>
							<th></th>
					</tr>
				</thead>
				<tbody id='table'>
				</tbody>
			</table>
			<hr>
			${pagination}
		`;

		panel.page.appendChild(container);
		const table = document.getElementById('table');

		for (const item of response.data.users) {
			const tr = document.createElement('tr');

			tr.innerHTML = `
				<tr>
					<td>
						<span class='icon' style="font-size: 1.25rem;">
							<i class='fas fa-${item.enabled ? 'check' : 'times'} has-text-${item.enabled ? 'success' : 'danger'}'></i>
						</span>
					</td>
					<td>
						<span class='icon' style="font-size: 1.25rem;">
							<i class='fas fa-${item.admin ? 'check' : 'times'} has-text-${item.admin ? 'success' : 'danger'}'></i>
						</span>
					</td>
					<th>${item.user_id}</th>
					<th>${item.username}</th>
					<th>${item.realname}</th>
					<th><span title="${item.token}">${item.token.slice(0, 10)}...</span></th>
					<td>${prettyDate(new Date(Number(item.timestamp) * 1000))}</td>
					<td>
						${Number(item.user_id) !== panel.user_id ? `
							<a class='button is-small is-info is-outlined' title='${item.admin ? 'Runterstufen' : 'Aufstufen'}' onclick='panel.modifyUser(${item.user_id}, "${item.username}", "${item.realname}", ${item.enabled}, ${!+item.admin})'>
								<span class='icon'>
									<span class="fa-stack fa-lg">
										<i class='fas fa-bolt fa-stack-1x has-text-black'></i>
										<div style="position: relative; margin-top: 120%; margin-left: 50%; font-size: .6rem;">
											${item.admin ? '<i class=\'fas fa-minus-circle fa-stack-1x has-text-danger\'></i>' : '<i class=\'fas fa-plus-circle fa-stack-1x has-text-success\'></i>'}
										</div>
									</span>
								</span>
							</a>
						` : ''}
					</td>
					<td>
						${Number(item.user_id) !== panel.user_id ? `
							<a class='button is-small is-info is-outlined' title='${item.enabled ? 'Deaktivieren' : 'Aktivieren'}' onclick='panel.modifyUser(${item.user_id}, "${item.username}", "${item.realname}", ${!+item.enabled}, ${item.admin})'>
								<span class='icon'>
									<span class="fa-stack fa-lg">
										<i class='fas fa-user-cog fa-stack-1x has-text-black'></i>
										<div style="font-size: 1.2rem;">
											${item.enabled ? '<i class=\'fas fa-ban fa-stack-1x has-text-danger\'></i>' : ''}
										</div>
									</span>
								</span>
							</a>
						` : ''}
					</td>
					<td>
						<a class='button is-small is-info is-outlined' title='Bearbeiten' onclick='panel.editUser(${item.user_id})'>
							<span class='icon'>
								<i class='fas fa-user-cog has-text-black'></i>
							</span>
						</a>
					</td>
				</tr>
				`;

			table.appendChild(tr);
		}
	})
		.catch(error => {
			console.log(error);
			// eslint-disable-next-line no-undef
			return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
		});
};

panel.editUser = function(userid = undefined) {
	if (!userid || !/^\d+$/.test(userid)) {
		return swal.fire({
			title: 'Benutzerbearbeitung',
			text: 'Keine UserID oder UserID nicht gültig',
			icon: 'error'
		});
	}

	if (!window.location.hash.startsWith('#editUser-')) {
		window.location.hash = `editUser-${userid}`;
	}

	// eslint-disable-next-line no-undef
	axios.post('/api/user/get', {
		user_id: userid
	}).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-else-return,no-undef
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		const user = response.data.user;

		panel.page.innerHTML = '';
		const container = document.createElement('div');
		container.innerHTML = `
			<div style="text-align: left;">
				<span style="width: 45%; text-align: left;">
					Benutzername:
				</span>
				<span style="width: 45%; float: right; text-align: left;">
					Vollständiger Name:
				</span>
			</div>
			<div class="control">
				<input id='user_name' class="input" type="text" placeholder="Benutzername/Nachname" value="${user.username}" style="width: 45%;">
				<input id='user_realname' class="input" type="text" placeholder="Vollständiger Name" value="${user.realname}" style="width: 45%; float: right;">
			</div>
			<br/>
			${Number(user.user_id) !== panel.user_id ? `
				<div class="control" style="height: 35px;">
					<span class="checkbox" style="width: 45%; float: left;">
						<input id="user_enabled" type="checkbox" ${user.enabled ? '' : 'checked'}>
						<span class="subtitle">
							Gesperrt
						</span>
					</span>
					<span class="checkbox" style="width: 45%; float: right;">
						<input id="user_admin" type="checkbox" ${user.admin ? 'checked' : ''}>
						<span class="subtitle">
							Admin
						</span>
					</span>
				</div>
			` : ''}
			<br/>
			<div>
				<a class="button" id='editBtn' onclick="panel.updateUser(${user.user_id})">
					<span>Benutzer speichern</span>
				</a>
			</div>
		`;
	
		panel.page.appendChild(container);
	})
		.catch(error => {
			console.log(error);
			// eslint-disable-next-line no-undef
			return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
		});
};

panel.updateUser = function(userid = null) {
	if (!panel.admin) return window.location = '/dashboard';

	const username = document.getElementById("user_name").value;
	const realname = document.getElementById("user_realname").value;
	const enabled = !document.getElementById("user_enabled").checked;
	const admin = document.getElementById("user_admin").checked;

	if (!userid) {
		return swal.fire({
			title: 'Benutzer',
			text: 'Kein UserID angegeben',
			icon: 'error'
		});
	}

	if (!username) {
		return swal.fire({
			title: 'Benutzer',
			text: 'Kein Benutzername angegeben',
			icon: 'error'
		});
	}

	if (!realname) {
		return swal.fire({
			title: 'Benutzer',
			text: 'Kein vollständiger Name angegeben',
			icon: 'error'
		});
	}

	panel.modifyUser(userid, username, realname, enabled, admin);
}

panel.modifyUser = function(userid = null, username = null, realname = null, enabled = false, admin = false) {
	if (!panel.admin) return window.location = '/dashboard';

	if (!userid) {
		return swal.fire({
			title: 'Userbearbeitung',
			text: 'Keine UserID',
			icon: 'error'
		});
	}

	if (!username) {
		return swal.fire({
			title: 'Userbearbeitung',
			text: 'Keine Benutzername angegeben',
			icon: 'error'
		});
	}

	if (!realname) {
		return swal.fire({
			title: 'Userbearbeitung',
			text: 'Keine vollständiger Name angegeben',
			icon: 'error'
		});
	}

	// eslint-disable-next-line no-undef
	axios.post('/api/user/edit', {
		user_id: userid,
		username: username,
		realname: realname,
		enabled: enabled,
		admin: admin,
	}).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-undef,no-else-return
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		// eslint-disable-next-line no-undef
		swal.fire({
			title: 'Woohoo!',
			text: 'Der Benutzer wurde erfolgreich geändert',
			icon: 'success',
			allowOutsideClick: false,
			toast: true,
			timer: 2500,
			showConfirmButton: false,
			position: 'top-end'
		}).then(() => {
			if (window.location.hash.startsWith('#listUser'))
				location.reload();
			else
				window.location.hash = `listUser-${Math.floor(userid / 25)}`;
		});
	})
	.catch(error => {
		console.log(error);
		// eslint-disable-next-line no-undef
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});
};

panel.createUser = function() {
	if (!panel.admin) return window.location = '/dashboard';

	panel.page.innerHTML = '';
	const container = document.createElement('div');
	container.innerHTML = `
		<div style="text-align: left;">
			<span style="width: 45%; text-align: left;">
				Benutzername:
			</span>
			<span style="width: 45%; float: right; text-align: left;">
				Vollständiger Name:
			</span>
		</div>
		<div class="control">
			<input id='user_name' class="input" type="text" placeholder="Benutzername/Nachname" style="width: 45%;">
			<input id='user_realname' class="input" type="text" placeholder="Vollständiger Name" style="width: 45%; float: right;">
		</div>
		<br/>
		<div style="text-align: left;">
			<span style="width: 45%; text-align: left;">
				Passwort:
			</span>
			<span style="width: 45%; float: right; text-align: left;">
				Passwort bestätigen:
			</span>
		</div>
		<div class="control">
			<input id='user_password' class="input" type="password" placeholder="Passwort" style="width: 45%;">
			<input id='user_password_control' class="input" type="password" placeholder="Passwort bestätigen" style="width: 45%; float: right;">
		</div>
		<br/>
		<div>
			<a class="button" id='createBtn' onclick="panel.makeUser()">
				<span>Benutzer erstellen</span>
			</a>
		</div>
	`;

	panel.page.appendChild(container);
};

panel.makeUser = function() {
	if (!panel.admin) return window.location = '/dashboard';

	const username = document.getElementById("user_name").value;
	const name = document.getElementById("user_realname").value;
	const password = document.getElementById("user_password").value;
	const password_control = document.getElementById("user_password_control").value;

	if (!username) {
		return swal.fire({
			title: 'Benutzer',
			text: 'Kein Benutzername angegeben',
			icon: 'error'
		});
	}

	if (!name) {
		return swal.fire({
			title: 'Benutzer',
			text: 'Kein vollständiger Name angegeben',
			icon: 'error'
		});
	}

	if (!password || !password_control) {
		return swal.fire({
			title: 'Benutzer',
			text: 'Kein Kennwort eingeben oder nicht bestätigt eingeben',
			icon: 'error'
		});
	}
	
	if (password !== password_control) {
		return swal.fire({
			title: 'Benutzer',
			text: 'Passwörter stimmen nicht überein',
			icon: 'error'
		});
	}

	// eslint-disable-next-line no-undef
	axios.post('/api/user/create', {
		username: username,
		name: name,
		password: password
	}).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-undef,no-else-return
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		// eslint-disable-next-line no-undef
		swal.fire({
			title: 'Woohoo!',
			text: 'Der Benutzer wurde erfolgreich erstellt.',
			icon: 'success',
			allowOutsideClick: false,
			toast: true,
			timer: 2500,
			showConfirmButton: false,
			position: 'top-end'
		}).then(() => {
			location.hash = `listUser-${Math.floor(response.data.user.user_id / 25)}`
			location.reload();
		});
	})
	.catch(error => {
		console.log(error);
		// eslint-disable-next-line no-undef
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});
};

panel.listService = function(page = undefined, search = undefined) {
	if (page === undefined) page = 0;

	page = Number(page);

	window.location.hash = `listService-${page}`;

	let url = `/api/service/index?page=${page}`;

	const requestObject = {
		view: panel.serviceView
	};

	if (search) requestObject.search = search;

	// eslint-disable-next-line no-undef
	axios.post(url, requestObject).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-else-return,no-undef
			else return swal.fire({
				title: 'An error ocurred', 
				text: response.data.description, 
				icon: 'error'
			}).then(() => {
				window.location.hash = `listService-0`;
			});
		}

		const maxpages = Math.ceil(Number(response.data.totalCount) / 25);

		if (page > maxpages - 1) return panel.listService(0, search);

		let prevPage = 0;
		let nextPage = page + 1;

		if (response.data.count <= 24) nextPage = page;

		if (page > 0) prevPage = page - 1;

		panel.page.innerHTML = '';
		const container = document.createElement('div');

		const pagelist = document.createElement('ul');
		pagelist.classList.add('pagination-list');

		let dotted = false;
		
		for (let i = 1; i <= maxpages; i++) {
			const item = document.createElement('li');

			if (page + 1 === i) {
				if (dotted) dotted = false;

				item.innerHTML = `
					<a class='pagination-link is-current'>${i}</a>
				`;
			} else {
				const distance = Math.abs(page + 1 - i);
	
				if (distance >= 2) {
					if (i === 1 || i === maxpages) {
						item.innerHTML = `
							<a class='pagination-link' onclick='panel.listService(${i - 1})'>${i}</a>
						`;
					} else {
						if (!dotted) {
							item.innerHTML = `
								<a class='pagination-ellipsis'>&hellip;</a>
							`;

							dotted = true;
						}
					}
				} else {
					item.innerHTML = `
						<a class='pagination-link' onclick='panel.listService(${i - 1})'>${i}</a>
					`;
				}
			}

			pagelist.appendChild(item);
		}

		const searchBar = `
			<div class='column is-left'>
				<div class="field has-addons">
					<p class="control">
						<span class="select">
							<select id="type">
								<option value="service_id" ${search ? search.type === 'service_id' ? 'selected' : '' : ''}>Service ID</option>
								<option value="name" ${search ? search.type === 'name' ? 'selected' : '' : ''}>Name</option>
								<option value="phonenumber" ${search ? search.type === 'phonenumber' ? 'selected' : '' : ''}>Rufnummer</option>
							</select>
						</span>
					</p>
					<p class="control">
						<input id="search" class="input" type="text" placeholder="Suche" value ="${search ? search.query || '' : ''}">
					</p>
					<p class="control">
						<a id='search_button' class="button" onclick="panel.listService(0, { type: document.getElementById('type').value, query: document.getElementById('search').value })">
							Suche
						</a>
					</p>
				</div>
			</div>
		`;

		const pagination = `
			<nav class='pagination is-centered'>
				<a class='pagination-previous' onclick='panel.listService(${prevPage}, ${JSON.stringify(search)})'>Vorherige Seite</a>
				<a class='pagination-next' onclick='panel.listService(${nextPage}, ${JSON.stringify(search)})'>Nächste Seite</a>

				${pagelist.outerHTML}
			</nav>`;

		const listType = `
		<div class='columns'>
			${searchBar}
			<div class='column is-cenetered'>
				<a class='button is-outlined is-info' title='Alle anzeigen' onclick='panel.setServiceView("all", ${page}, ${JSON.stringify(search)})'>
					<span class='icon'>
						<i class='fa fa-list-ul has-text-black'></i>
					</span>
				</a>
				<a class='button is-outlined is-info' title='Nicht Abgeschlossen anzeigen' onclick='panel.setServiceView("unfinished", ${page}, ${JSON.stringify(search)})'>
					<span class='icon'>
						<span class="fa-stack fa-lg">
							<i class='fas fa-wrench has-text-success fa-stack-1x'></i>
							<div style="position: relative; margin-left: -15%; margin-top: 89%; font-size: 1.9rem;">
								<i class='fas fa-ban fa-stack-1x has-text-danger'></i>
							</div>
						</span>
					</span>
				</a>
				<a class='button is-outlined is-info' title='Nicht Herrausgegeben anzeigen' onclick='panel.setServiceView("undelivered", ${page}, ${JSON.stringify(search)})'>
					<span class='icon'>
						<span class="fa-stack fa-lg">
							<i class='fas fa-hand-holding fa-stack-1x' data-fa-transform='flip-h'></i>
							<div style="position: relative; margin-top: 75%; margin-left: -60%; font-size: .8rem;">
								<i class='fas fa-reply fa-stack-1x has-text-success'></i>
							</div>
							<div style="position: relative; margin-left: -15%; margin-top: 89%; font-size: 1.9rem;">
								<i class='fas fa-ban fa-stack-1x has-text-danger'></i>
							</div>
						</span>
					</span>
				</a>
				<a class='button is-outlined is-info' title='Nicht Berechnet anzeigen' onclick='panel.setServiceView("unpaid", ${page}, ${JSON.stringify(search)})'>
					<span class='icon'>
						<span class="fa-stack fa-lg">
							<i class='far fa-money-bill-alt has-text-success fa-stack-1x'></i>
							<div style="position: relative; margin-left: -15%; margin-top: 89%; font-size: 1.9rem;">
								<i class='fas fa-ban fa-stack-1x has-text-danger'></i>
							</div>
						</span>
					</span>
				</a>
			</div>
			<div class='column is-right'>
				<a class='button is-outlined is-info' title='Kundendaten ${panel.dataView === 'hidden' ? 'einblenden' : 'ausblenden'}' onclick='panel.setDataView("${panel.dataView === 'hidden' ? 'show' : 'hidden'}", ${page}, ${JSON.stringify(search)})'>
					<span class='icon'>
						<span class="fa-stack fa-lg">
							<i class='fas fa-user has-text-success fa-stack-1x'></i>
							<div style="position: relative; margin-left: -15%; margin-top: 89%; font-size: 1.9rem;${panel.dataView === 'hidden' ? ' display: none;' : ''}">
								<i class='fas fa-ban fa-stack-1x has-text-danger'></i>
							</div>
						</span>
					</span>
				</a>
			</div>
		</div>`;

		container.innerHTML = `
			${pagination}
			<hr>
			${listType}
			<table class='table is-striped is-narrow is-left is-fullwidth'>
				<thead>
					<tr>
						<th>	
							<span class='icon' style="font-size: 1.25rem;" title='Berechnet'>
								<i class='far fa-money-bill-alt has-text-success'></i>
							</span>
						</th>
						<th>	
							<span class='icon' style="font-size: 1.25rem;" title='Ausgehändigt'>
								<span class="fa-stack fa-lg" style="height: 25px;">
									<i class='fas fa-hand-holding has-text-info fa-stack-1x' data-fa-transform='flip-h'></i>
									<div style="position: relative; margin-top: 40%; margin-left: -60%; font-size: .8rem;">
										<i class='fas fa-reply fa-stack-1x has-text-success'></i>
									</div>
								</span>
							</span>
						</th>
						<th>	
							<span class='icon' style="font-size: 1.25rem;" title='Fertig'>
								<i class='fas fa-wrench has-text-success'></i>
							</span>
						</th>
						<th>Service Nr</th>
						<th>Datum</th>
						<th>Name</th>
						<th>Telefonnummer</th>
						<th>Geräte-Typ</th>
						<th></th>
						<th></th>
						<th></th>
					</tr>
				</thead>
				<tbody id='table'>
				</tbody>
			</table>
			<hr>
			${pagination}
		`;

		panel.page.appendChild(container);

		const table = document.getElementById('table');

		for (const item of response.data.services) {
			//if (panel.serviceView === 'unfinished' && item.finished) continue; 
			//if (panel.serviceView === 'undelivered' && item.handed_out) continue; 
			//if (panel.serviceView === 'unpaid' && item.paid) continue; 

			const tr = document.createElement('tr');

			tr.innerHTML = `
				<tr>
					<td>
						<span class='icon' style="font-size: 1.25rem;">
							<i class='fas fa-${item.paid ? 'check' : 'times'} has-text-${item.paid ? 'success' : 'danger'}'></i>
						</span>
					</td>
					<td>
						<span class='icon' style="font-size: 1.25rem;">
							<i class='fas fa-${item.handed_out ? 'check' : 'times'} has-text-${item.handed_out ? 'success' : 'danger'}'></i>
						</span>
					</td>
					<td>
						<span class='icon' style="font-size: 1.25rem;">
							<i class='fas fa-${item.finished ? 'check' : item.assigned_user ? 'spinner fa-pulse' : 'times'} has-text-${item.finished ? 'success' : item.assigned_user ? 'info' : 'danger'}'></i>
						</span>
					</td>
					<th><a onclick="panel.showService(${item.service_id})">${item.service_id}</a></th>
					<th>${prettyDate(new Date(item.timestamp * 1000))}</th>
					<th>${panel.dataView === 'show' ? item.name : '■■■■■■■■'}</th>
					<th>${panel.dataView === 'show' ? item.phonenumber : '■■■■■■■■'}</th>
					<th>${item.device_type}</th>
					<td>
						<a class='button is-small is-info is-outlined' title='Anzeigen' onclick='panel.showService(${item.service_id})'>
							<span class='icon'>
								<i class='far fa-eye has-text-black'></i>
							</span>
						</a>
					</td>
					<td>
						<a class='button is-small is-info is-outlined' title='Drucken' onclick='panel.printService(${item.service_id})'>
							<span class='icon'>
								<i class='fas fa-print has-text-black'></i>
							</span>
						</a>
					</td>
					<td>
						<a class='button is-small is-info is-outlined' title='Bearbeiten' onclick='panel.editService(${item.service_id})'>
							<span class='icon'>
								<i class='fas fa-cog has-text-black'></i>
							</span>
						</a>
					</td>
				</tr>
				`;

			table.appendChild(tr);
			
			if (!panel.timer) panel.timer = window.setInterval(panel.listService, 5*60*1000, page, search);
		}
	})
		.catch(error => {
			console.log(error);
			// eslint-disable-next-line no-undef
			return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
		});
};

panel.createService = function() {
	panel.page.innerHTML = '';
	const container = document.createElement('div');
	container.innerHTML = `
		<div style="text-align: left;">
			<span style="width: 45%; text-align: left;">
				Kundenname:
			</span>
			<span style="width: 45%; float: right; text-align: left;">
				Telefonnummer:
			</span>
		</div>
		<div class="control">
			<input id='customer_name' class="input" type="text" placeholder="Name" style="width: 45%;">
			<input id='customer_phonenumber' class="input" type="text" placeholder="Telefonnummer" style="width: 45%; float: right;">
		</div>
		<br/>
		<div style="text-align: left;">
			<span style="width: 45%; text-align: left;">
				Passwort
			</span>
		</div>
		<div class="control">
			<input id='customer_password' class="input" type="text" placeholder="Passwort" style="width: 45%;">
		</div>
		<br/>
		<div style="text-align: left;">
			<span style="width: 45%; text-align: left;">
				Fehlerkategory:
			</span>
			<span style="width: 45%; float: right; text-align: left;">
				Gerätetyp:
			</span>
		</div>
		<div class="control">
			<span class="select" style="width: 45%; float: left;">
				<select id='customer_category' style="width: 100%;">
					<option value="Neugerät">Neugerät</option>
					<option value="OS startet nicht">OS startet nicht</option>
					<option value="Gerät geht nicht an">Gerät geht nicht an</option>
					<option value="Bluescreen">Bluescreen</option>
					<option value="Antivirus erneuern">Antivirus erneuern</option>
					<option value="Allgemeiner Check">Allgemeiner Check</option>
					<option value="OS neuinstallieren">OS neuinstallieren</option>
					<option value="OS neuinstallation mit Backup">OS neuinstallation mit Backup</option>
					<option value="Divers/Anderes">Divers/Anderes</option>
				</select>
			</span>
			<span class="select" style="width: 45%; float: right;">
				<select id='customer_device_type' style="width: 100%;">
					<option value="Laptop">Laptop</option>
					<option value="Computer">Computer</option>
					<option value="Handy">Handy</option>
					<option value="Drucker">Drucker</option>
					<option value="Divers/Anderes">Divers/Anderes</option>
				</select>
			</span>
		</div>
		<br/>
		<br/>
		<br/>
		<div class="control">
			Beschreibung:
			<textarea id='customer_description' class="input" type="text" style="height: 500px;" placeholder="Beschreibung"></textarea>
		</div>
		<br/>
		<div>
			<a class="button" id='createBtn' onclick="panel.makeService()">
				<span>Auftrag erstellen</span>
			</a>
		</div>
	`;

	panel.page.appendChild(container);
};

panel.makeService = function() {
	const name = document.getElementById("customer_name").value;
	const phonenumber = document.getElementById("customer_phonenumber").value;
	const password = document.getElementById("customer_password").value;
	const device_type = document.getElementById("customer_device_type").value;
	const category = document.getElementById("customer_category").value;
	const description = document.getElementById("customer_description").value;

	if (!name) {
		return swal.fire({
			title: 'Kundenname',
			text: 'Kein Kundenname angegeben',
			icon: 'error'
		});
	}

	if (!phonenumber) {
		return swal.fire({
			title: 'Telefonnummer',
			text: 'Keine Telefonnummer eingeben',
			icon: 'error'
		});
	}
	
	if (!/^\d+$/.test(phonenumber)) {
		return swal.fire({
			title: 'Telefonnummer',
			text: 'Keine gültige Telefonnummer',
			icon: 'error'
		});
	}

	if (!description) {
		return swal.fire({
			title: 'Beschreibung',
			text: 'Beschreibung nicht vorhanden',
			icon: 'error'
		});
	}

	// eslint-disable-next-line no-undef
	axios.post('/api/service/create', {
		name: name,
		phonenumber: ` ${phonenumber} `,
		device_type: device_type,
		description: description,
		category: category,
		password: password
	}).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-undef,no-else-return
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		// eslint-disable-next-line no-undef
		swal.fire({
			title: 'Woohoo!',
			text: 'Der Service Auftrag wurde erfolgreich erstellt.',
			icon: 'success',
			allowOutsideClick: false,
			toast: true,
			timer: 2500,
			showConfirmButton: false,
			position: 'top-end'
		}).then(() => {
			location.hash = `listService-0`;
			window.open(`/print?service_id=${response.data.service.service_id}&token=${response.data.service.token}`, '_blank');
		});
	})
	.catch(error => {
		console.log(error);
		// eslint-disable-next-line no-undef
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});
};

panel.editService = function(serviceid = null) {
	if (!serviceid || !/^\d+$/.test(serviceid)) {
		return swal.fire({
			title: 'Servicebearbeitung',
			text: 'Keine ServiceID oder ServiceID nicht gültig',
			icon: 'error'
		});
	}

	if (!window.location.hash.startsWith('#editService-')) {
		window.location.hash = `editService-${serviceid}`;
	}

	axios.post('/api/service/get', {
		service_id: serviceid
	}).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-undef,no-else-return
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		const service = response.data.service;
		const users = response.data.users;

		panel.page.innerHTML = '';

		const select = document.createElement('select');
		select.id = 'worker_assigned_user';
		select.value = service.assigned_user_id || null;
		select.style = 'width: 100%;';

		const no_assigned = document.createElement('option');
		no_assigned.value = '';
		no_assigned.text = 'Niemand';
		select.appendChild(no_assigned);

		for (let user of users) {
			if (user.username === 'root' || !user.enabled) continue;
			const option = document.createElement('option');
			option.value = user.user_id;
			option.text = user.realname;

			if (service.assigned_user && service.assigned_user.username === user.username) option.setAttribute('selected', '');

			select.appendChild(option);
		}

		const container = document.createElement('div');
		container.innerHTML = `
			<h1 class="title">
				Serviceauftrag #${service.service_id}
			</h1>
			<div style="text-align: left;">
				<span style="width: 45%; text-align: left;">
					Kundenname:
				</span>
				<span style="width: 45%; float: right; text-align: left;">
					Telefonnummer:
				</span>
			</div>
			<div class="control">
				<input id='customer_name' class="input" type="text" placeholder="Name" value="${service.name}" style="width: 45%;">
				<input id='customer_phonenumber' class="input" type="text" placeholder="Telefonnummer" value="${Number.isInteger(service.phonenumber) ? service.phonenumber.toString().replace(/\s+/g, '') : service.phonenumber.replace(/\s+/g, '')}" style="width: 45%; float: right;">
			</div>
			<br/>
			<div style="text-align: left;">
				<span style="width: 45%; text-align: left;">
					Passwort
				</span>
			</div>
			<div class="control">
				<input id='customer_password' class="input" type="text" placeholder="Passwort" value="${service.password || ''}" style="width: 45%;">
			</div>
			<br/>
			<div style="text-align: left;">
				<span style="width: 45%; text-align: left;">
					Angenommen von:
				</span>
				<span style="width: 45%; float: right; text-align: left;">
					Bearbeitender Mitarbeiter:
				</span>
			</div>
			<div class="control">
				<input class="input" type="text" disabled placeholder="" value="${service.creator ? service.creator.realname : ''}" style="width: 45%;">
				<span class="select" style="width: 45%; float: right;">
					${select.outerHTML}
				</span>
			</div>
			<br/>
			<div style="text-align: left;">
				<span style="width: 45%; text-align: left;">
					Fehlerkategory:
				</span>
				<span style="width: 45%; float: right; text-align: left;">
					Gerätetyp:
				</span>
			</div>
			<div class="control">
				<span class="select" style="width: 45%; float: left;">
					<select id='customer_category' style="width: 100%;">
						<option hidden  value="${service.category}">${service.category}</option>
						<option value="Neugerät">Neugerät</option>
						<option value="OS startet nicht">OS startet nicht</option>
						<option value="Gerät geht nicht an">Gerät geht nicht an</option>
						<option value="Bluescreen">Bluescreen</option>
						<option value="Antivirus erneuern">Antivirus erneuern</option>
						<option value="Allgemeiner Check">Allgemeiner Check</option>
						<option value="OS neuinstallieren">OS neuinstallieren</option>
						<option value="OS neuinstallation mit Backup">OS neuinstallation mit Backup</option>
						<option value="Divers/Anderes">Divers/Anderes</option>
					</select>
				</span>
				<span class="select" style="width: 45%; float: right;">
					<select id='customer_device_type' style="width: 100%;">
						<option hidden  value="${service.device_type}">${service.device_type}</option>
						<option value="Laptop">Laptop</option>
						<option value="Computer">Computer</option>
						<option value="Handy">Handy</option>
						<option value="Drucker">Drucker</option>
						<option value="Divers/Anderes">Divers/Anderes</option>
					</select>
				</span>
			</div>
			<br/>
			<br/>
			<br/>
			<div class="control">
				<span class="checkbox" style="width: 45%; float: left;">
					<input id="worker_handed_out" type="checkbox" ${service.handed_out ? 'checked' : ''}>
					<span class="is-size-6">
						Gerät ausgehändigt
					</span>
		  		</span>
				<span class="checkbox" style="width: 45%; float: right;">
					<input id="worker_finished" type="checkbox" ${service.finished ? 'checked' : ''}>
					<span class="is-size-6">
						Bearbeitung abgeschlossen
					</span>
				</span>
			</div>
			<br/>
			<br/>
			<div class="control">
				<span class="checkbox" style="width: 45%; float: left;">
					<input id="worker_paid" type="checkbox" ${service.paid ? 'checked' : ''}>
					<span class="is-size-6">
						Berechnet
					</span>
		  		</span>
			</div>
			<br/>
			<br/>
			<div class="control">
				Beschreibung:
				<textarea id='customer_description' class="input" type="text" style="height: 200px;" placeholder="Beschreibung">${service.description || ''}</textarea>
			</div>
			<br/>
			<div class="control">
				Bericht (Kunde):
				<textarea id='worker_report' class="input" type="text" style="height: 200px;" placeholder="Kundenbericht">${service.finished_report || ''}</textarea>
			</div>
			<br/>
			<div class="control">
				Interne Notiz:
				<textarea id='worker_note' class="input" type="text" style="height: 100px;" placeholder="Interne Notizen">${service.worker_note || ''}</textarea>
			</div>
			<br/>
			<div class="control">
				<a class="button" id='editBtn' onclick="panel.updateService(${service.service_id})">
					<span>Auftrag speichern</span>
				</a>
			</div>
		`;
	
		panel.page.appendChild(container);
	})
	.catch(error => {
		console.log(error);
		// eslint-disable-next-line no-undef
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});
};

panel.updateService = function(serviceid = null) {
	if (!serviceid) {
		return swal.fire({
			title: 'Servicebearbeitung',
			text: 'Keine ServiceID',
			icon: 'error'
		});
	}

	const name = document.getElementById("customer_name").value;
	const phonenumber = document.getElementById("customer_phonenumber").value;
	const password = document.getElementById("customer_password").value;
	const device_type = document.getElementById("customer_device_type").value;
	const category = document.getElementById("customer_category").value;
	const description = document.getElementById("customer_description").value;
	const finished_report = document.getElementById("worker_report").value;
	const worker_note = document.getElementById("worker_note").value;
	const finished = document.getElementById("worker_finished").checked;
	const paid = document.getElementById("worker_paid").checked;
	const handed_out = document.getElementById("worker_handed_out").checked;
	const assigned_user = document.getElementById("worker_assigned_user").value;

	if (!name) {
		return swal.fire({
			title: 'Kundenname',
			text: 'Kein Kundenname angegeben',
			icon: 'error'
		});
	}

	if (!phonenumber) {
		return swal.fire({
			title: 'Telefonnummer',
			text: 'Keine Telefonnummer eingeben',
			icon: 'error'
		});
	}
	
	if (!/^\d+$/.test(phonenumber)) {
		return swal.fire({
			title: 'Telefonnummer',
			text: 'Keine gültige Telefonnummer',
			icon: 'error'
		});
	}

	if (!description) {
		return swal.fire({
			title: 'Beschreibung',
			text: 'Beschreibung nicht vorhanden',
			icon: 'error'
		});
	}

	// eslint-disable-next-line no-undef
	axios.post('/api/service/edit', {
		service_id: serviceid,
		name: name,
		phonenumber: ` ${phonenumber} `,
		password: password,
		device_type: device_type,
		description: description,
		category: category,
		finished_report: finished_report,
		worker_note: worker_note,
		finished: finished,
		paid: paid,
		handed_out: handed_out,
		assigned_user: assigned_user
	}).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-undef,no-else-return
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		// eslint-disable-next-line no-undef
		swal.fire({
			title: 'Woohoo!',
			text: 'Der Serviceauftrag wurde erfolgreich aktualisiert.',
			icon: 'success',
			allowOutsideClick: false,
			toast: true,
			timer: 2500,
			showConfirmButton: false,
			position: 'top-end'
		});
	})
	.catch(error => {
		console.log(error.response.data);
		// eslint-disable-next-line no-undef
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});
};

panel.showService = function(serviceid = null) {
	if (!serviceid) {
		return swal.fire({
			title: 'Servicebearbeitung',
			text: 'Keine ServiceID',
			icon: 'error'
		});
	}
	
	// eslint-disable-next-line no-undef
	axios.post('/api/service/get', {
		service_id: serviceid
	}).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-undef,no-else-return
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		// eslint-disable-next-line no-undef
		//swal.fire({
		//	title: 'Woohoo!',
		//	text: 'Der Serviceauftrag wird im neuen Fenster/Tab geöffnet.',
		//	icon: 'success'
		//}).then(() => {
			window.open(`/show?service_id=${response.data.service.service_id}&token=${response.data.service.token}`, '_blank');
		//});
	})
	.catch(error => {
		console.log(error.response.data);
		// eslint-disable-next-line no-undef
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});
};

panel.printService = function(serviceid = null) {
	if (!serviceid) {
		return swal.fire({
			title: 'Servicebearbeitung',
			text: 'Keine ServiceID',
			icon: 'error'
		});
	}
	
	// eslint-disable-next-line no-undef
	axios.post('/api/service/get', {
		service_id: serviceid
	}).then(response => {
		if (response.data.success === false) {
			if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
			// eslint-disable-next-line no-undef,no-else-return
			else return swal.fire('An error ocurred', response.data.description, 'error');
		}

		// eslint-disable-next-line no-undef
		//swal.fire({
		//	title: 'Woohoo!',
		//	text: 'Der Serviceauftrag wird im neuen Fenster/Tab geöffnet.',
		//	icon: 'success'
		//}).then(() => {
			window.open(`/print?service_id=${response.data.service.service_id}&token=${response.data.service.token}`, '_blank');
		//});
	})
	.catch(error => {
		console.log(error.response.data);
		// eslint-disable-next-line no-undef
		return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
	});
};

panel.setServiceView = function(view, page, search) {
	localStorage.serviceView = view;
	panel.serviceView = view;
	panel.listService(page, search);
};

panel.setDataView = function(view, page, search) {
	localStorage.dataView = view;
	panel.dataView = view;
	panel.listService(page, search);
};

panel.changeToken = function() {
	// eslint-disable-next-line no-undef
	axios.get('/api/tokens')
		.then(response => {
			if (response.data.success === false) {
				if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
				// eslint-disable-next-line no-undef,no-else-return
				else return swal.fire('An error ocurred', response.data.description, 'error');
			}

			panel.page.innerHTML = '';
			const container = document.createElement('div');
			container.className = 'container';
			container.innerHTML = `
				<h2 class='subtitle'>API Token verwalten</h2>

				<label class='label'>Dein aktueller Token:</label>
				<div class='field has-addons'>
					<div class="control is-expanded">
						<input id='token' readonly class='input' type='text' placeholder='Your token' value='${response.data.token}'>
					</div>
					<div class="control">
						<a id='getNewToken' class='button is-primary'>Neuen token erstellen</a>
					</div>
				</div>
			`;

			panel.page.appendChild(container);

			document.getElementById('getNewToken').addEventListener('click', () => {
				panel.getNewToken();
			});
		})
		.catch(error => {
			console.log(error);
			// eslint-disable-next-line no-undef
			return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
		});
};

panel.getNewToken = function() {
	// eslint-disable-next-line no-undef
	axios.post('/api/tokens/change')
		.then(response => {
			if (response.data.success === false) {
				if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
				// eslint-disable-next-line no-undef,no-else-return
				else return swal.fire('An error ocurred', response.data.description, 'error');
			}

			// eslint-disable-next-line no-undef
			swal.fire({
				title: 'Woohoo!',
				text: 'Der Token wurde erfolgreich erneuert.',
				icon: 'success',
				toast: true,
				timer: 2500,
				showConfirmButton: false,
				position: 'top-end'
			}).then(() => {
				localStorage.token = response.data.token;
				axios.defaults.headers.common['token'] = response.data.token;
				location.reload();
			});
		})
		.catch(error => {
			console.log(error);
			// eslint-disable-next-line no-undef
			return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
		});
};

panel.changePassword = function() {
	panel.page.innerHTML = '';
	const container = document.createElement('div');
	container.className = 'container';
	container.innerHTML = `
		<h2 class='subtitle'>Passwort ändern</h2>

		<label class='label'>Neues Passwort:</label>
		<div class='control'>
			<input id='password' class='input is-expanded' type='password' placeholder='Dein Passwort'>
		</div>
		<label class='label'>Passwort bestätigen:</label>
		<div class='field has-addons'>
			<div class="control is-expanded">
				<input id='passwordConfirm' class='input' type='password' placeholder='Neues Passwort bestätigen'>
			</div>
			<div class="control">
				<a id='sendChangePassword' class='button is-primary'>Neues Passwort setzen</a>
			</div>
		</div>
	`;

	panel.page.appendChild(container);

	document.getElementById('sendChangePassword').addEventListener('click', () => {
		if (document.getElementById('password').value === document.getElementById('passwordConfirm').value) {
			panel.sendNewPassword(document.getElementById('password').value);
		} else {
			// eslint-disable-next-line no-undef
			swal.fire({
				title: 'Passwörter nicht identisch!',
				text: 'Die Passwörter stimmen nicht überein bitte versuche es erneut.',
				icon: 'error'
			}).then(() => {
				panel.changePassword();
			});
		}
	});
};

panel.sendNewPassword = function(pass) {
	// eslint-disable-next-line no-undef
	axios.post('/api/password/change', { password: pass })
		.then(response => {
			if (response.data.success === false) {
				if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
				// eslint-disable-next-line no-undef,no-else-return
				else return swal.fire('An error ocurred', response.data.description, 'error');
			}

			// eslint-disable-next-line no-undef
			swal.fire({
				title: 'Woohoo!',
				text: 'Das Passwort wurde erfolgreich geändert.',
				icon: 'success',
				toast: true,
				timer: 2500,
				showConfirmButton: false,
				position: 'top-end'
			}).then(() => {
				location.reload();
			});
		})
		.catch(error => {
			console.log(error);
			// eslint-disable-next-line no-undef
			return swal.fire('An error ocurred', 'There was an error with the request, please check the console for more information.', 'error');
		});
};

panel.setActiveMenu = function(item) {
	const menu = document.getElementById('menu');
	const items = menu.getElementsByTagName('a');
	for (let i = 0; i < items.length; i++) items[i].className = '';

	item.className = 'is-active';
};

window.onload = function() {
	panel.preparePage();
};

window.onhashchange = function () {
	panel.prepareDashboard();
}

window.onkeydown = function(event) {
	if (event.code === 'Enter' || event.code === 'NumpadEnter') {

		if (swal.isVisible()) {
			swal.close();
			return;
		}

		if (window.location.hash.startsWith('#listService-')) {
			const button = document.getElementById('search_button');

			button.onclick.apply(button);
			return
		}
	}

	if (event.ctrlKey && event.key === 's') {
		event.preventDefault();

		if (window.location.hash.startsWith('#edit'))
			document.getElementById('editBtn').click();
		
		if (window.location.hash.startsWith('#create'))
			document.getElementById('createBtn').click();
	}
}

function prettyDate(date) {
	return date.getDate() + '.'
		+ (date.getMonth() + 1) + '.'
		+ date.getFullYear() + ' '
		+ (date.getHours() < 10 ? '0' : '')
		+ date.getHours() + ':'
		+ (date.getMinutes() < 10 ? '0' : '')
		+ date.getMinutes() + ':'
		+ (date.getSeconds() < 10 ? '0' : '')
		+ date.getSeconds();
}

panel.inactivityTime = function () {
	if (!panel.token) return;

	window.addEventListener('load', resetTimer, true);
	const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
	events.forEach(function(name) {
	 document.addEventListener(name, resetTimer, true); 
	});

    function logout() {
		panel.logout();
    }

    function resetTimer() {
		clearTimeout(panel.timeout);
		if (panel.username === 'lemke')
			panel.timeout = setTimeout(logout, 5*60*60*1000);
		else
			panel.timeout = setTimeout(logout, 15*60*1000);
    }
};

panel.updateStats = function () {
	if (!panel.token) return;

	axios.post('/api/service/stats')
		.then(response => {
			if (response.data.success === false) {
				clearInterval(panel.statTimeout);
				if (response.data.description === 'No token provided') return panel.verifyToken(panel.token);
				// eslint-disable-next-line no-undef,no-else-return
				else return swal.fire('An error ocurred', response.data.description, 'error');
			}

			const data = response.data.stat_result[0];
			
			document.getElementById('stat_total').innerText = data.count_total;
			document.getElementById('stat_finished').innerText = data.count_finished;
			document.getElementById('stat_handed_out').innerText = data.count_handed_out;
			document.getElementById('stat_paid').innerText = data.count_paid;

			panel.statTimeout = setInterval(this.updateStats, 1*60*1000);
		});
};
