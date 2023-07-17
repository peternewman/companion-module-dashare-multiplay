const { InstanceBase, InstanceStatus, TelnetHelper, Regex, runEntrypoint } = require('@companion-module/base')
const { getActions } = require('./actions')
const { getPresets } = require('./presets')

const TelnetSocket = TelnetHelper

class MultiplayInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	localUpdateStatus(status, message) {
		if (this.localStatus !== status || this.message !== message) {
			this.updateStatus(status, message)
			this.localStatus = status
			this.localStatusMessage = message
		}
	}

	configUpdated(config) {
		this.config = config
		this.initTcp()
	}

	incomingData(data) {
		this.log('debug', data)

		this.localUpdateStatus(InstanceStatus.Ok, 'Received data')
	}

	async init(config) {
		this.localStatus = undefined
		this.localStatusMessage = undefined
		this.localUpdateStatus(InstanceStatus.Disconnected)

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

		if (self.config.host && self.config.port) {
			self.socket = new TelnetSocket(self.config.host, self.config.port)

			self.socket.on('status_change', function (status, message) {
				if (status !== InstanceStatus.Ok) {
					// TODO(Peter): Remap status here
					self.localUpdateStatus(status, message)
				}
			})

			self.socket.on('error', function (err) {
				self.localUpdateStatus(InstanceStatus.ConnectionFailure, err.message)
				self.log('error', 'Network error: ' + err.message)
			})

			self.socket.on('connect', function () {
				self.localUpdateStatus(InstanceStatus.Ok)
				self.log('debug', 'Connected')
			})

			self.socket.on('error', function (err) {
				self.localUpdateStatus(InstanceStatus.UnknownError, err.message)
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
		} else {
			self.localUpdateStatus(InstanceStatus.BadConfig, 'Host or port missing or invalid')
			self.log('error', 'Bag config: host or port missing or invalid')
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
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port number',
				width: 6,
				default: '2000',
				regex: Regex.PORT,
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
		this.setActionDefinitions(getActions(this))
	}

	initPresets() {
		this.setPresetDefinitions(getPresets())
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
