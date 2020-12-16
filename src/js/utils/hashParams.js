export default function hashParams() {
	var hashParams = {};
	var e, r = /([^&;=]+)=?([^&;]*)/g,
		q = window.location.hash.substring(1);
	while ( e = r.exec(q)) { //  eslint-disable-line no-cond-assign
		hashParams[e[1]] = decodeURIComponent(e[2]);
	}
	return hashParams;
}