const { combineRgb } = require('@companion-module/base')

exports.getPresets = function () {
	const blueShade = combineRgb(51, 51, 255)
	const white = combineRgb(255, 255, 255)
	let presets = {}

	presets.go = {
		category: 'Basic control',
		name: 'GO',
		type: 'button',
		style: {
			text: 'GO',
			size: '14',
			color: white,
			bgcolor: blueShade,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'go',
					},
				],
			},
		],
	}

	presets.stop_all = {
		category: 'Basic control',
		name: 'Stop All',
		type: 'button',
		style: {
			text: 'Stop All',
			size: '14',
			color: white,
			bgcolor: blueShade,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'stop_all',
					},
				],
			},
		],
	}

	presets.pause = {
		category: 'Basic control',
		name: 'Pause',
		type: 'button',
		style: {
			text: 'Pause',
			size: '14',
			color: white,
			bgcolor: blueShade,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'pause',
					},
				],
			},
		],
	}

	presets.resume = {
		category: 'Basic control',
		name: 'Resume',
		type: 'button',
		style: {
			text: 'Resume',
			size: '14',
			color: white,
			bgcolor: blueShade,
		},
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'resume',
					},
				],
			},
		],
	}

	return presets
}
