'use strict';

var https   = require('https');
var tls     = require('tls');
var config  = require('../../config/Config');
var logger  = new (require('../utils/Logger'))(config.AppModules.SNIServer);
var servers = {};

class SNIServer {

	// TODO: static method SNIServer.something instead of getSNIServer function below

	constructor(port, requestListener) {
		this.port            = port;
		this.hosts           = {};
		this.requestListener = requestListener;
		this.server          = null;
		this.started         = false;
	}

	//noinspection JSUnusedGlobalSymbols
	start(callback) {
		if (this.started) {
			return;
		}
		this.server = https.createServer({
			SNICallback: this.SNICallback.bind(this),
		}, this.requestListener);

		this.server.listen(this.port, callback);

		for (let host in this.hosts) {
			//noinspection JSUnfilteredForInLoop
			logger.info(`starting server on ${host}`)
		}

		this.started = true;
	}

	getServer() {
		return this.server;
	};

	getPort() {
		return this.server.address().port;
	};

	addFqdn(fqdn, certs) {
		if (this.hosts[fqdn]) {
			return;
		}
		this.hosts[fqdn] = {certs};
	}

	getSecureContext(servername) {
		if (!this.hosts[servername]) {
			logger.error(`SNIServer.getSecureContext: Host ${servername} is unknown`);
			return;
		}
		if (!this.hosts[servername].secureContext) {
			this.hosts[servername].secureContext = tls.createSecureContext(this.hosts[servername].certs);
		}
		return this.hosts[servername].secureContext;
	}

	SNICallback(servername, cb) {
		if (!this.hosts[servername]) {
			cb(`Host ${servername} is unknown`, null);
			return;
		}
		cb(null, this.getSecureContext(servername));
	}

	static get(port, requestListener) {
		if (!servers[port]) {
			servers[port] = new SNIServer(port, requestListener);
		}
		return servers[port];
	}
}

module.exports = SNIServer;
