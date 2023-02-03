function markProblem(element, mark) {
	if (mark === true) {
		$(element).css('background', '#FF7F7F')
	} else {
		$(element).css('background', '#FFF')
	}
}

function validateColor(settingId, color) {
	const pattern = new RegExp(/([0-9A-Fa-f]{6}$)|([0-9A-Fa-f]{3}$)/i)
	const validInput = pattern.test(color);
	markProblem(settingId, !validInput);
}

let validateUrl = function (settingId, url) {
	const validInput = false;
	if (url === '') {
		validInput = true
	}
	else {
		let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		validInput = regexp.test(url);
	}
	markProblem(settingId, !validInput);
}

function addToDroplist(value, label, droplist) {
	let droplist_elem = $(droplist)
	droplist_elem.append($('<option>', {
		value: value,
		text: label
	}))
}

function arrayObjectIndexOf(objArray, key, value) {
	for (let i = 0; i < objArray.length; i++) {
		if (objArray[i][key] === value) {
			return i
		}
	}
	return -1
}

function getSortedNames() {
	let namesToIds = {}
	account.users.forEach(function (userObj) {
		namesToIds[userObj.props.name] = userObj.props.id
	})

	let sorted = []
	for (let key in namesToIds) {
		sorted[sorted.length] = key
	}
	sorted.sort()

	let tempDict = {}
	for (let i = 0; i < sorted.length; i++) {
		tempDict[sorted[i]] = namesToIds[sorted[i]]
	}
	namesToIds = tempDict
	return namesToIds
}

/** 
 * Generates a randum number using the Linear congruential generator algorithm
 * @param {*} seed - RNG seed value
 */
function LcgRng (seed, init=true) {
	if (init) {
		seed = (seed % 2147483647)
		if (seed <= 0) {
			seed += 2147483646
		}
	}
	return seed * 16807 % 2147483647
}

function calculateDiceRolls(dieNum, dieSides, seed) {
	let results = []
	let result = LcgRng(seed)
	results.push(result % dieSides + 1)
	for (let die = 1; die < dieNum; die++) {
		result = LcgRng(result, false)
		results.push(result % dieSides + 1)
	}
	total = results.reduce((a, b) => a + b, 0)
	return {
		'results': results,
		'total': total
	}
}

function generateRngResult (command, message, seed) {
	const MSG_ARGS = message.split(/ /gm)
	let resultMsg = ''
	if (command === 'rng-coinflip') {
		const outcomes = ['heads', 'tails']
		resultMsg += `flips a coin. It lands on... ${outcomes[LcgRng(seed) % 2]}!`
	}
	else if (command === 'rng-roll') {
		let diceArgs
		if (MSG_ARGS.length === 1) {
			diceArgs = [1, 20]
		}
		else {
			diceArgs = parseRoll(MSG_ARGS[1])
		}
		const result = calculateDiceRolls(diceArgs[0], diceArgs[1], seed)
		resultMsg += `rolled ${diceArgs[0]}d${diceArgs[1]}: ${result['results'].join(' ')} (total: ${result.total})`
	}
	else if (command === 'rng-rps') {
		const outcomes = ['Rock!', 'Paper!', 'Scissors!']
		resultMsg += `plays Rock, Paper, Scissors and chooses... ${outcomes[Math.ceil(Math.random() * 3) % 3].toString()}`
	}

	return resultMsg
}

function parsePostCommand(message) {
	let command = ''
	if (message.startsWith('/roll')) {
		command = 'rng-roll';
	}
	else if (message.startsWith('/coinflip')) {
		command = 'rng-coinflip';
	}
	else if (message.startsWith('/rps')) {
		command = 'rng-rps';
	}
	else if (message.startsWith('/me')){
		command = 'me';
	}
	return command
}

function parseRoll(rollArgs){
	const DIE_NUM_MIN = 1
	const DIE_NUM_MAX = 100
	const DIE_SIDE_MIN = 2
	const DIE_SIDE_MAX = 1000000
	let die = 1
	let sides = 20
	die = parseInt(rollArgs.split('d')[0])
	sides = parseInt(rollArgs.split('d')[1])
	die = Math.min(Math.max(die, DIE_NUM_MIN), DIE_NUM_MAX)
	sides = Math.min(Math.max(sides, DIE_SIDE_MIN), DIE_SIDE_MAX)
	return [die, sides]
}

function getCssRoomName(roomName) {
	return roomName.replace(/[^a-z0-9]/g, function(s) {
		var c = s.charCodeAt(0);
		if (c === 32) return '-';
		if (c >= 65 && c <= 90) return '' + s.toLowerCase();
		return ('000' + c.toString(16)).slice(-4);
	});
}

function displayNotification(message, timeout) {
	if (document.hidden === false) {
		return;
	}
	let notification = new Notification(message);
	setTimeout(() => {notification.close()}, timeout);
}

function createTimestamp(time) {
	const timestamp = new Date(time)
	const dateString = timestamp.toLocaleDateString(navigator.language, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	})
	const delim = dateString.indexOf('/', 3)
	const timeString = timestamp.toTimeString().substring(0,5)
	return `${dateString.substring(0, delim)} ${timeString}`
}
