/**
 * Marks an HTML element with red or white if there's a problem
 * @param {string} element Full selector of the HTML element to mark
 * @param {boolean} mark If the mark is for good or bad
 */
function markProblem(element, mark) {
	if (mark === true) {
		$(element).css('background', '#FF7F7F')
	} else {
		$(element).css('background', '#FFF')
	}
}

/**
 * Checks to see if an input is valid or not and marks it accordingly
 * @param {string} settingId Full selector of the HTML element to check
 * @param {string} setting What kind of setting is being checked
 * @return If the input is valid or not
 */
function validateSetting(settingId, setting) {
	let validInput = false
	let input = $(settingId).val()

	if (setting === "url") {
		validInput = validateUrl(input)
	}
	else if (setting === 'color') {
		input = input.replace('#', '')
		validInput = validateColor(input)
	}
	markProblem(settingId, !validInput)
	return validInput
}

/**
 * Makes sure the color input is a valid hex color input
 * @param {string} color Color input
 * @returns If the color input is valid
 */
function validateColor(color) {
	let pattern = new RegExp(/([0-9A-Fa-f]{6}$)|([0-9A-Fa-f]{3}$)/i)
	return pattern.test(color)
}

/**
 * Makes sure the URL input is valid
 * @param {string} url URL input
 * @returns If the URL input is valid
 */
let validateUrl = function (url) {
	if (url === '') {
		return true
	}
	else {
		let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		return (regexp.test(url) === true)
	}
}

/**
 * Adds an option to a select element with a value and its label
 * @param {string} value Value of the option element
 * @param {string} label Label of the option element
 * @param {object} droplist Which select element to add option to
 */
function addToDroplist(value, label, droplist) {
	let droplist_elem = $(droplist)
	droplist_elem.append($('<option>', {
		value: value,
		text: label
	}))
}

/**
 * In an array of objects, return the first instance where a key matches the
 * value being searched.
 * @param {array} objArray Array of objects
 * @param {*} key Key to look for
 * @param {*} value Value of the key to match
 * @return Index of the first instance where the key matches the value, -1 
 *         otherwise.
 */
function arrayObjectIndexOf(objArray, key, value) {
	for (let i = 0; i < objArray.length; i++) {
		if (objArray[i][key] === value) {
			return i
		}
	}
	return -1
}

/**
 * Sorts the account's username list to alphabetical order
 */
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
		command = 'rng-roll'
	}
	else if (message.startsWith('/coinflip')) {
		command = 'rng-coinflip'
	}
	else if (message.startsWith('/rps')) {
		command = 'rng-rps'
	}
	else if (message.startsWith('/me')){
		command = 'me'
	}
	return command
}

/**
 * Gets the list of vanity names and maps them to an ID
 */
function getVanityNamesToIds() {
	let vanityToIds = {}
	for(let user in messenger.users){
		let vanityName = messenger.users[user].props.vanity
		if(vanityName)
		vanityToIds[vanityName] = user
	}
	return vanityToIds
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
	if (document.hidden) {
		let notification = new Notification(message)
		setTimeout(() => {
			notification.close()
		}, timeout)
	}
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
