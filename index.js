const { InstanceBase, InstanceStatus, TelnetHelper, runEntrypoint } = require('@companion-module/base')
var actions = require('./actions')
var presets = require('./presets')
var debug
var log

const TelnetSocket = TelnetHelper

class MultiplayInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.login = false
		//	// super-constructor
		//	instance_skel.apply(this, arguments);
		//	self.status(1,'Initializing');
		//	self.actions(); // export actions
	}

	async configUpdated(config) {
		var self = this
		self.config = config
		self.init_tcp()
		self.initPresets()
	}

	incomingData(data) {
		this.log('debug', data)

		this.updateStatus(InstanceStatus.Ok, 'Received data')
		this.log('info', 'logged in')
	}

	async init(config) {
		var self = this

		this.updateStatus(InstanceStatus.Disconnected)

		this.config = config

		debug = self.debug
		log = self.log

		this.init_tcp()
		self.initPresets()
		actions(this)

		//		self.setActionDefinitions(actions.getActions()); // export actions
	}

	init_tcp() {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
			self.login = false
		}

		if (self.config.host) {
			self.socket = new TelnetSocket(self.config.host, self.config.port)

			self.socket.on('status_change', function (status, message) {
				if (status !== InstanceStatus.Ok) {
					// TODO(Peter): Remap status here
					self.updateStatus(status, message)
				}
			})

			self.socket.on('error', function (err) {
				self.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				//debug("Network error", err);
				self.log('error', 'Network error: ' + err.message)
			})

			self.socket.on('connect', function () {
				self.updateStatus(InstanceStatus.Ok)
				self.log('debug', 'Connected')
				self.login = false
			})

			self.socket.on('error', function (err) {
				self.updateStatus(InstanceStatus.UnknownError, err.message)
				//debug("Network error", err);
				self.log('error', 'Network error: ' + err.message)
				self.login = false
			})

			// if we get any data, display it to stdout
			self.socket.on('data', function (buffer) {
				var indata = buffer.toString('utf8')
				self.incomingData(indata)
			})

			self.socket.on('iac', function (type, info) {
				// tell remote we WONT do anything we're asked to DO
				if (type == 'DO') {
					self.socket.write(Buffer.from([255, 252, info]))
				}

				// tell the remote DONT do whatever they WILL offer
				if (type == 'WILL') {
					self.socket.write(Buffer.from([255, 254, info]))
				}
			})
		}
	}

	// Return config fields for web config
	getConfigFields() {
		var self = this

		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This will establish a Telnet connection to MultiPlay',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP address of the player',
				width: 12,
				default: '127.0.0.1',
				regex: self.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port number',
				width: 6,
				default: '2000',
				regex: self.REGEX_PORT,
			},
		]
	}

	// When module gets deleted
	destroy() {
		var self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
		}

		self.log('debug', 'destroy ' + self.id)
	}

	initPresets(updates) {
		var self = this
		self.setPresetDefinitions(presets.getPresets(self))
	}

	// TODO(Peter): Add these commands?
	/*		case 'clear':
			cmd = 'clear';
			break;

		case 'version':
			cmd = 'version';
			break;

		case 'quit':
			cmd = 'quit';
			break;
	*/
}

runEntrypoint(MultiplayInstance, [])
