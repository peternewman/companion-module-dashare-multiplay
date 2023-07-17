exports.getActions = function (self) {
	return {
		go: {
			name: 'GO',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'go')
			},
		},
		stop_all: {
			name: 'Stop all cues',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'stop_all')
			},
		},
		fade_all: {
			name: 'Fade all cues',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'fade_all')
			},
		},
		pause_all: {
			name: 'Pause all cues',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'pause_all')
			},
		},
		resume_all: {
			name: 'Resume all cues',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'resume_all')
			},
		},
		stopwatch_start: {
			name: 'Stopwatch start',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'stopwatch_start')
			},
		},
		stopwatch_stop: {
			name: 'Stopwatch stop',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'stopwatch_stop')
			},
		},
		stopwatch_reset: {
			name: 'Stopwatch reset',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'stopwatch_reset')
			},
		},
		advance: {
			name: 'Advance current GO position',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'advance')
			},
		},
		pause: {
			name: 'Pause cue',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'pause')
			},
		},
		resume: {
			name: 'Resume cue',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'resume')
			},
		},
		stop: {
			name: 'Stop cue',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'stop')
			},
		},
		jump: {
			name: 'Jump to near end of cue',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'jump')
			},
		},
		next_track: {
			name: 'Next track in playlist',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'next_track')
			},
		},
		previous_track: {
			name: 'Previous track in playlist',
			options: [],
			callback: async (action) => {
				await sendCommand(self, 'previous_track')
			},
		},
	}
}

async function sendCommand(self, command) {
	try {
		console.log('sending command: ' + command)
		if (command !== undefined) {
			if (self.socket !== undefined && self.socket.isConnected) {
				self.socket.send(command + '\n')
			} else {
				console.error('Socket not connected :(')
			}
		}
	} catch (error) {
		self.log(`error`, `sendCommand Action Callback Error: ${error.message}`)
	}
}
