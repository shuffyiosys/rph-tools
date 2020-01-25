

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
	var validInput = false
	var input = $(settingId).val()

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
	var pattern = new RegExp(/([0-9A-Fa-f]{6}$)|([0-9A-Fa-f]{3}$)/i)
	return pattern.test(color)
}

/**
 * Makes sure the URL input is valid
 * @param {string} url URL input
 * @returns If the URL input is valid
 */
var validateUrl = function (url) {
	var match = false
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	var pingExt = url.slice((url.length - 4), (url.length))

	if (url === '') {
		match = true
	} else if (regexp.test(url) === true) {
		if (pingExt == ".wav" || pingExt == ".ogg" || pingExt == ".mp3") {
			match = true
		}
	}
	return match
}

/**
 * Adds an option to a select element with a value and its label
 * @param {string} value Value of the option element
 * @param {string} label Label of the option element
 * @param {object} droplist Which select element to add option to
 */
function addToDroplist(value, label, droplist) {
	var droplist_elem = $(droplist)
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
	for (var i = 0; i < objArray.length; i++) {
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
	var namesToIds = {}
	account.users.forEach(function (userObj) {
		namesToIds[userObj.props.name] = userObj.props.id
	})

	var sorted = []
	for (var key in namesToIds) {
		sorted[sorted.length] = key
	}
	sorted.sort()

	var tempDict = {}
	for (var i = 0; i < sorted.length; i++) {
		tempDict[sorted[i]] = namesToIds[sorted[i]]
	}
	namesToIds = tempDict
	return namesToIds
}

/** 
 * Generates a randum number using the Linear congruential generator algorithm
 * @param {*} seed - RNG seed value
 */
function LcgRng (seed) {
	let result = (((seed * 214013) + 2531011) % Math.pow(2,31))
	return result
}

function generateRngResult (command, message, date) {
	let resultMsg = ''
	if (command === 'rng-coinflip') {
		const outcomes = ['heads', 'tails']
		resultMsg += `flips a coin. It lands on... ${outcomes[LcgRng(date) % 2]}!`
	}
	else if (command === 'rng-roll') {
		const diceArgs = parseRoll(message)
		let results = []
		let result = LcgRng(date)
		results.push(result % diceArgs[1] + 1)
		for (let die = 1; die < diceArgs[0]; die++) {
			result = LcgRng(result)
			results.push(result % diceArgs[1] + 1)
		}
		total = results.reduce((a, b) => a + b, 0)
		resultMsg += `rolled ${diceArgs[0]}d${diceArgs[1]}: ${results.join(' ')} (total: ${total})`
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

function parseRoll(rollCmd){
	const DIE_NUM_MIN = 1
	const DIE_NUM_MAX = 100
	const DIE_SIDE_MIN = 2
	const DIE_SIDE_MAX = 1000000
	const args = rollCmd.split(/ (.+)/)
	var die = 1
	var sides = 20
	if (args.length > 1) {
		die = parseInt(args[1].split('d')[0])
		sides = parseInt(args[1].split('d')[1])
	}
	die = Math.min(Math.max(die, DIE_NUM_MIN), DIE_NUM_MAX)
	sides = Math.min(Math.max(sides, DIE_SIDE_MIN), DIE_SIDE_MAX)
	return [die, sides]
}