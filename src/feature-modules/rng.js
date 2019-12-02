/** 
 * Random number generator module. This is mostly used for chance games that
 * can happen in the chat
 */
var rngModule = (function () {
	var DIE_MIN = 1
	var DIE_MAX = 100
	var DIE_SIDE_MIN = 2
	var DIE_SIDE_MAX = 100
	var RNG_NUM_MIN = -10000000000000
	var RNG_NUM_MAX = 10000000000000

	var html = {
		'tabId': 'rng-module',
		'tabName': 'Random Numbers',
		'tabContents':
			'<h3>Random Numbers</h3><br />' +
			'<h4>Shortcuts</h4>' +
			'<div class="rpht-option-block">' +
			'	<table style="width: 600px;">' +
			'		<tbody>' +
			'			<tr>' +
			'				<td><span style="font-family: courier">/coinflip</span></td>' +
			'				<td>Coin flip (heads or tails)</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<td><span style="font-family: courier">/roll [num die]d[sides]</span></td>' +
			'				<td style="width: 65%;">Dice roll. Doing just "<code>/roll</code>" is 1d20.<br>' +
			'					[num die] is number of dice to roll. [sides] is how many sides per die. Example <code>/roll' +
			'						2d10</code> will roll 2 10-sided dice</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<td><span style="font-family: courier">/random</span></td>' +
			'				<td>Generates random number based on RNG settings below</td>' +
			'			</tr>' +
			'			<tr>' +
			'				<td><span style="font-family: courier">/rps</span></td>' +
			'				<td>Do rock, paper, scissors</td>' +
			'			</tr>' +
			'		</tbody>' +
			'	</table>' +
			'</div>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<p><strong>Coin flip</strong></p>' +
			'		<button type="button" id="coinRngButton" style="float:right;">Flip a coin!</button><br/><br/>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<p><strong>Dice roll</strong></p>' +
			'		<label class="rpht-label text-input-label">Number of die </label><input class="rpht-short-input" type="number" id="diceNum" name="diceNum" max="100" min="1" value="2"><br /><br />' +
			'		<label class="rpht-label text-input-label">Sides </label><input class="rpht-short-input" type="number" id="diceSides" name="diceSides" max="1000" min="2" value="6"><br /><br />' +
			'		<button type="button" id="diceRngButton" style="float:right;">Let\'s roll!</button><br/><br/>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<p><strong>General RNG</strong></p>' +
			'		<label class="rpht-label text-input-label">Minimum: </label><input class="rpht-short-input" type="number" id="rngMinNumber" name="rngMinNumber" max="4294967295" min="-4294967296" value="0"><br /><br />' +
			'		<label class="rpht-label text-input-label">Maximum: </label><input class="rpht-short-input" type="number" id="rngMaxNumber" name="rngMaxNumber" max="4294967295" min="-4294967296" value="10"><br /><br />' +
			'		<button type="button" id="randomRngButton" style="float:right;">Randomize!</button><br/><br/>' +
			'	</div>' +
			'</div>'
	}

	/** 
	 * Initializes the GUI components of the module.
	 */
	function init() {
		$('#diceNum').blur(function () {
			var dieNum = parseInt($('#diceNum').val())
			if (dieNum < DIE_MIN) {
				$('#diceNum').val(DIE_MIN)
			} else if (DIE_MAX < dieNum) {
				$('#diceNum').val(DIE_MAX)
			}
		})

		$('#diceSides').blur(function () {
			var dieSides = parseInt($('#diceSides').val())
			if (dieSides < DIE_SIDE_MIN) {
				$('#diceSides').val(DIE_SIDE_MIN)
			} else if (DIE_SIDE_MAX < dieSides) {
				$('#diceSides').val(DIE_SIDE_MAX)
			}
		})

		$('#rngMinNumber').blur(function () {
			var minNum = parseInt($('#rngMinNumber').val())
			if (minNum < RNG_NUM_MIN) {
				$('#rngMinNumber').val(RNG_NUM_MIN)
			} else if (RNG_NUM_MAX < minNum) {
				$('#rngMinNumber').val(RNG_NUM_MAX)
			}
		})

		$('#rngMaxNumber').blur(function () {
			var maxNum = parseInt($('#rngMaxNumber').val())
			if (maxNum < RNG_NUM_MIN) {
				$('#rngMaxNumber').val(RNG_NUM_MIN)
			} else if (RNG_NUM_MAX < maxNum) {
				$('#rngMaxNumber').val(RNG_NUM_MAX)
			}
		})

		$('#coinRngButton').click(function () {
			sendResult(genCoinFlip())
		})

		$('#diceRngButton').click(function () {
			var dieNum = parseInt($('#diceNum').val())
			var dieSides = parseInt($('#diceSides').val())
			sendResult(getDiceRoll(dieNum, dieSides))
		})

		$('#randomRngButton').click(function () {
			sendResult(genRandomNum())
		})
	}

	/** 
	 * Generates a coin flip
	 * @returns String contaning the coin flip results.
	 */
	function genCoinFlip() {
		var coinMsg = '/me flips a coin. It lands on... '
		if (Math.ceil(Math.random() * 2) == 2) {
			coinMsg += 'heads!'
		} else {
			coinMsg += 'tails!'
		}

		return attachIntegrity(coinMsg)
	}

	/**
	 * Genreates a dice roll
	 * @param {number} dieNum Number of die to use
	 * @param {number} dieSides Number of sides per die
	 * @param {boolean} showTotals Flag to show the total value of the roll
	 * @returns String containing the dice roll result
	 */
	function getDiceRoll(dieNum, dieSides) {
		/* Cap the values, just in case. */
		dieNum = (dieNum > DIE_MAX) ? DIE_MAX : dieNum
		dieNum = (dieNum < DIE_MIN) ? DIE_MIN : dieNum
		dieSides = (dieSides > DIE_SIDE_MAX) ? DIE_SIDE_MAX : dieSides
		dieSides = (dieSides < DIE_SIDE_MIN) ? DIE_SIDE_MIN : dieSides

		var dieMsg = '/me rolled ' + dieNum + 'd' + dieSides + ':'

		for (i = 0; i < dieNum; i++) {
			var result = Math.ceil(Math.random() * dieSides)
			dieMsg += ' '
			dieMsg += result
		}
		return attachIntegrity(dieMsg)
	}

	/**
	 * Generates a random number between a min and max
	 * @param {number} minNum Minimum end of the range
	 * @param {number} maxNum Maximum end of the range
	 * @returns String containing the random number result.
	 */
	function genRandomNum() {
		var minNum = parseInt($('#rngMinNumber').val())
		var maxNum = parseInt($('#rngMaxNumber').val())
		var ranNumMsg = '(( Random number generated (' + minNum + ' to ' +
			maxNum + '): '
		ranNumMsg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) +
			' ))'
		return attachIntegrity(ranNumMsg)
	}

	/**
	 * Sends the result of a random number generated to the server
	 * @param {string} outcomeMsg A built string to show up on the chat.
	 */
	function sendResult(outcomeMsg) {
		var class_name = $('li.active')[0].className.split(" ")
		var room_name = ""
		var this_room = null
		var userID = parseInt(class_name[2].substring(0, 6))
		var chatModule = rphToolsModule.getModule('Chat Module')
		

		/* Populate room name based on if showing usernames is checked. */
		if (chatModule) {
			room_name = $('li.active').find("span:first").text()
		} else {
			room_name = $('li.active')[0].textContent.slice(0, -1)
		}

		this_room = getRoom(room_name)
		this_room.sendMessage(outcomeMsg, userID)
	}

	function attachIntegrity (outcomeMsg) {
		outcomeMsg += '\u200b'
		return outcomeMsg
	}
	
	function getHtml() {
		return html
	}

	function toString() {
		return 'RNG Module'
	}

	/**
	 * Public members of the module exposed to others.
	 */
	return {
		init,
		genCoinFlip,
		getDiceRoll,
		genRandomNum,
		getHtml,
		toString,
	}
}());