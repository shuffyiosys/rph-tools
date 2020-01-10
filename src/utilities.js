/**
 * Gets the value from an input element.
 * @param {string} settingId Full selector of the input to get its value
 * @return The extracted HTML's value
 */
function getInput(settingId) {
	return $(settingId).val()
}

/**
 * Gets the value of a checkbox
 * @param {string} settingId Full selector of the checkbox to get the value
 * @return The extracted HTML's value
 */
function getCheckBox(settingId) {
	return $(settingId).is(':checked')
}

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
	else if (setting === "color-allrange") {
		input = input.replace('#', '')
		validInput = validateColor(input)
	}
	else if (setting === "color") {
		input = input.replace('#', '')
		validInput = validateColor(input)
		validInput = validateColorRange(input)
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
 * Makes sure the color is less than #DDDDDD or #DDD depending on how many
 * digits were entered.
 * @param {string} TextColor String representation of the color.
 * @return True if the color is within range, false otherwise.
 */
function validateColorRange(TextColor) {
	var validColor = false
	var red = 255
	var green = 255
	var blue = 255

	/* If the color text is 3 characters, limit it to #DDD */
	if (TextColor.length == 3) {
		red = parseInt(TextColor.substring(0, 1), 16)
		green = parseInt(TextColor.substring(1, 2), 16)
		blue = parseInt(TextColor.substring(2, 3), 16)

		if ((red <= 0xD) && (green <= 0xD) && (blue <= 0xD)) {
			validColor = true
		}
	}
	/* If the color text is 6 characters, limit it to #DDDDDD */
	else if (TextColor.length == 6) {
		red = parseInt(TextColor.substring(0, 2), 16)
		green = parseInt(TextColor.substring(2, 4), 16)
		blue = parseInt(TextColor.substring(4, 6), 16)
		if ((red <= 0xDD) && (green <= 0xDD) && (blue <= 0xDD)) {
			validColor = true
		}
	}
	return validColor
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