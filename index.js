const { InstanceBase, InstanceStatus, TelnetHelper, runEntrypoint } = require('@companion-module/base')
var actions = require('./actions')
var presets = require('./presets')

const TelnetSocket = TelnetHelper

class MultiplayInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	configUpdated(config) {
		this.config = config
		this.initTcp()
		this.initPresets()
	}

	incomingData(data) {
		this.log('debug', data)

		this.updateStatus(InstanceStatus.Ok, 'Received data')
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Disconnected)

		this.config = config

		this.initTcp()
		this.initActions()
		this.initPresets()
	}

	initTcp() {
		let self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
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
				self.log('error', 'Network error: ' + err.message)
			})

			self.socket.on('connect', function () {
				self.updateStatus(InstanceStatus.Ok)
				self.log('debug', 'Connected')
			})

			self.socket.on('error', function (err) {
				self.updateStatus(InstanceStatus.UnknownError, err.message)
				self.log('error', 'Network error: ' + err.message)
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
				regex: this.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port number',
				width: 6,
				default: '2000',
				regex: this.REGEX_PORT,
			},
		]
	}

	// When module gets deleted
	destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}

		this.log('debug', 'destroy ' + this.id)
	}

	initActions() {
		this.setActionDefinitions(actions.getActions(this))
	}

	initPresets() {
		this.setPresetDefinitions(presets.getPresets())
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
