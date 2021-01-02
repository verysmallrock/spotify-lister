export default class AppSettings {
	static isDev() {
		return !this.isProd()
	}

	static isProd () {
		return !window.location.host.startsWith('localhost')
	}
}