/**
 * Offers a common point for command interpretation
 */
let interpreterModule = (function () {
	const CMD_PASS = 1
	const PASSTHRU = 0
	const CMD_ERR = -1

	function init() {
		return
	}

	/**
	 * Parses a command and returns a result from it.
	 * @param {*} command - Comamnd that was inputted
	 * @returns - Object containing a status response and string output
	 */
	function parseCommand(command, User=null, thisRoom=null, origin='chat') {
		let cmdArgs = command.split(/ (.+)/)
		let result = {str: command, status: PASSTHRU}

		const rngModule = rphToolsModule.getModule('RNG Module')
		const moddingModule = rphToolsModule.getModule('Modding Module')
		switch (cmdArgs[0]) {
			/** Format: /[cmd] [message] */
			case '/status':
			case '/away':
				if (cmdArgs.length > 1 && User) {
					let type = (cmdArgs[0] === '/away') ? 1 : 0
					socket.emit('modify', {
						userid: User.props.id,
						statusMsg: cmdArgs[1],
						statusType: type
					})
					result.status = CMD_PASS
				}
				break
			case '/coinflip':
				if (rngModule) {
					result.str = rngModule.genCoinFlip()
					result.status = CMD_PASS
				}
				break
			case '/roll':
				let die = 1
				let sides = 20
				if (cmdArgs.length > 1) {
					die = parseInt(cmdArgs[1].split('d')[0])
					sides = parseInt(cmdArgs[1].split('d')[1])
				}

				if (isNaN(die) || isNaN(sides)) {
					result.status = CMD_ERR
				}
				else if (rngModule) {
					let die = 1
					let sides = 20

					result.str = rngModule.getDiceRoll(die, sides, true)
					result.status = CMD_PASS
				}
				else if (origin === 'pm') {
					let rolls = []
					let total = 0
					let result = LcgRng(data.date)
					rolls.push(result  % sides + 1)
					for (let i = 1; i < die; i++) {
						result = LcgRng(result)
						rolls.push(result % sides + 1)
					}
					total = rolls.reduce((a, b) => a + b, 0)
					msg = `rolled ${die}d${sides}: `
					msg += rolls.join(' ') + ' (total ' + total + ')'
				}
				break
			case '/random':
				if (rngModule) {
					result.status = CMD_PASS
					if (cmdArgs[1] && cmdArgs[1].split(/,/).length > 1) {
						let range = cmdArgs[1].split(/,/)
						range[0] = parseInt(range[0])
						range[1] = parseInt(range[1])
						result.str = rngModule.genRandomNum(range[0], range[1])
					}
					else {
						result.str = rngModule.genRandomNum()
					}
				}
				break
			case '/rps':
				const results = ['Rock', 'Paper', 'Scissors']
				result.str = `'/me plays Rock, Paper, Scissors and chooses... ${results[Math.ceil(Math.random() * 3) % 3].toString()}!`
				result.status = CMD_PASS
				break
			case '/kick':
			case '/ban':
			case '/unban':
			case '/add-owner':
			case '/add-mod':
			case '/remove-owner':
			case '/remove-mod':
				if (cmdArgs.length < 2) {
					result.status = CMD_ERR
				} else if (moddingModule && User && thisRoom) {
					let action = cmdArgs[0].substring(1, cmdArgs[0].length)
					let args = cmdArgs[1].split(/,(.+)/)
					let reason = (args[1]) ? args[1] : ''
					moddingModule.emitModAction(action, args[0], User.props.name,
						thisRoom.props.name, reason)
					result.status = CMD_PASS
				}
				break
			default:
				break
		}
		return result
	}

	/**
	 * Parses a RNG message to take what the client sent and seed it into an
	 * RNG.
	 * @param {*} message - Message from the sender.
	 */
	function parseRng(data) {
		let newMsg = ""
		let message = data.msg.substring(0, data.msg.indexOf('\u200b'));
		if (message.match(new RegExp(/coin/, 'gi'))){
			newMsg = "flips a coin. It lands on... "
			if (LcgRng(data.time) % 2 === 1) {
				newMsg += "heads!"
			}
			else {
				newMsg += "tails!"
			}
		}
		else if (message.match(new RegExp(/rolled/, 'gi'))){
			let numbers = message.match(new RegExp(/[0-9]+/, 'gi'))
			let sides = parseInt(numbers[1])
			let dieNum = parseInt(numbers[0])
			let results = []
			let total = 0
			let seed = data.time

			let result = LcgRng(seed)
			results.push(result % sides + 1)
			for (let die = 1; die < dieNum; die++) {
				result = LcgRng(result)
				results.push(result % sides + 1)
			}
			total = results.reduce((a, b) => a + b, 0)
			newMsg = `rolled ${numbers[0]}d${numbers[1]}: `
			newMsg += results.join(' ') + ' (total ' + total + ')'
			console.log('[parseRng] Dice roll params', numbers, data.time)
		}
		else if (message.match(new RegExp(/generated/, 'gi'))){
			let resultStartIdx = message.indexOf(':')
			let numbers = message.match(new RegExp(/-?[0-9]+/, 'gi'))
			let seed = parseInt(numbers[2]) + data.time
			newMsg = message.substring(0, resultStartIdx)
			newMsg += ': ' + LcgRng(parseInt(seed)) % (numbers[1] - numbers[0] + 1 ) + ' ))'
			console.log(`[parseRng]: General RNG params`, numbers, data.time)
		}
		return newMsg
	}

	/** 
	 * Generates a randum number using the Linear congruential generator algorithm
	 * @param {*} value - Number that seeds the RNG
	 */
	function LcgRng (value) {
		let result = (((value * 214013) + 2531011) % Math.pow(2,31))
		return result
	}


	function toString() {
		return 'Interpreter Module'
	}

	return {
		init,
		parseCommand,
		parseRng,
		toString
	}
}());