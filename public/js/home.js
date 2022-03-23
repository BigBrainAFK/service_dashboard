/* eslint-env browser */
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
