// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    4.2.10
// @description Adds extended settings to RPH
// @match      https://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT
// ==/UserScript==

const VERSION_STRING = '4.2.10'

const SETTINGS_NAME = "rph_tools_settings"
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

function getCssRoomName(roomName) {
	return roomName.toLowerCase().replace(/ /g, '-')
}/**
 * Generates a hash value for a string
 * This was modified from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 */
String.prototype.hashCode = function () {
	var hash = 0,
		i, chr, len
	if (this.length === 0) return hash
	for (i = 0, len = this.length; i < len; i++) {
		chr = this.charCodeAt(i)
		hash = ((hash << 31) - hash) + chr
		hash |= 0; // Convert to 32bit integer
	}
	return hash
}

function floodTracker(User, Room, message) {
	let thisTab = rph.tabs[User.props.id]
	let newLength = message.length
	let curTime = Math.round(new Date().getTime() / 1000)

	if (message.includes('\n')) {
		newLength = newLength + (message.split('\n').length * 250)
	}
	thisTab.bufferLength = (thisTab.bufferLength / (curTime - thisTab.lastTime + 1)) + ((newLength + thisTab.bufferLength) / 3) + 250
	thisTab.lastTime = curTime
	if (thisTab.bufferLength > 1750) {
		thisTab.offenses += 1
	}

	if (thisTab.offenses > 2) {
		Room.sendMessage('Flood kick', User.props.id)
		socket.disconnect()
	} else if (thisTab.offenses === 2) {
		Room.appendMessage(
			'<span class="first">&nbsp;</span>\n\
		<span title="' + makeTimestamp(false, true) + '">You are flooding. Be careful or you\'ll be kicked</span>'
		).addClass('sys')
		setTimeout(() => {
			thisTab.offenses = 0
		}, 15000)
	}

	return thisTab.offenses > 2
}
/****
 * This module handles the chat functions of the script.
 ****/
var chatModule = (function () {
	var chatSettings = {}

	var localStorageName = "chatSettings"

	var pingSound = null

	var autoDismissTimer = null

	var autoJoinTimer = null

	const AUTOJOIN_TIMEOUT_SEC = 5 * 1000

	const MAX_ROOMS = 30

	const AUTOJOIN_INTERVAL = 2 * 1000

	var html = {
		'tabId': 'chat-module',
		'tabName': 'Chat',
		'tabContents': '<h3>Chat Options</h3><br/>' +
			'<h4>General options</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="chatColorEnable">Stylize messages with user\'s color</label>' +
			'		<label class="switch"><input type="checkbox" id="chatColorEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Stylize a user\'s text with their color(s)</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="chatSimpleColorEnable">Use simple color stylizing</label>' +
			'		<label class="switch"><input type="checkbox" id="chatSimpleColorEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Only stylize with the user\'s primary color</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="chatmsgPaddingEnable">Add padding between messages</label>' +
			'		<label class="switch"><input type="checkbox" id="chatmsgPaddingEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Adds some padding at the end of each message for readibility</label>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<label class="rpht-label checkbox-label" for="chatCmdPopupEnable">Show chat command popup</label>' +
			'		<label class="switch"><input type="checkbox" id="chatCmdPopupEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">If you type "/" as the first character, a pop-up shows displaying the commands</label>' +
			'	</div>' +
			'</div>' +
			'<h4>Chat Pinging</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="notifyPingEnable">Enable pings</label>' +
			'		<label class="switch"><input type="checkbox" id="notifyPingEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">	Turns on ping notifications in chat</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="selfPingEnable">Can ping yourself</label>' +
			'		<label class="switch"><input type="checkbox" id="selfPingEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Pings will trigger on your own messages</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="notifyNotificationEnable">Enable desktop notifications</label>' +
			'		<label class="switch"><input type="checkbox" id="notifyNotificationEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Pops up a notification when you get pinged</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label style="font-weight: bold; width:522px; padding: 0px;">Desktop notification duration</label>' +
			'		<select style="float: right; width: 80px;" id="pingNotifyTimeoutSelect">' +
			'			<option value="3000">Short</option>' +
			'			<option value="6000" selected>Normal</option>' +
			'			<option value="10000">Long</option>' +
			'		</select>' +
			'		<label class="rpht-label descript-label">How long the notification will stay up</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<p>Names to be pinged (comma separated)</p>' +
			'		<textarea id="pingNames" rows="8" class="rpht_textarea"> </textarea>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label><strong>Ping sound URL</strong></label><br>' +
			'		<input type="text" class="rpht-long-input" id="pingURL"><br><br>' +
			'		<label class="rpht-label descript-label">URL to an audio file, or leave blank for no sound</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="pingExactMatch">Exact match</label>' +
			'		<label class="switch"><input type="checkbox" id="pingExactMatch"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">e.g., If pinging on "Mel", matches on "Mel" and not "Melody"</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="pingCaseSense">Case sensitive</label>' +
			'		<label class="switch"><input type="checkbox" id="pingCaseSense"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">e.g., If pinging on "Mel", matches on "Mel" and not "mel"</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<h4>Ping styling</h4>' +
			'		<label class="rpht-label text-input-label">Text Color</label><input type="text" class="rpht-short-input" id="pingTextColor" value="#000"><br /><br />' +
			'		<label class="rpht-label text-input-label">Highlight</label><input type="text" class="rpht-short-input" id="pingHighlightColor" value="#FFA"><br><br>' +
			'		<label class="rpht-label checkbox-label" style="font-weight:initial;" for="pingBoldEnable">Add <strong>bold</strong></label>' +
			'		<label class="switch"><input type="checkbox" id="pingBoldEnable"><span class="rpht-slider round"></span></label><br><br>' +
			'		<label class="rpht-label checkbox-label" style="font-weight:initial;" for="pingItalicsEnable">Add <em>Italics</em></label>' +
			'		<label class="switch"><input type="checkbox" id="pingItalicsEnable"><span class="rpht-slider round"></span></label>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'			<label class="rpht-label checkbox-label">Ping Tester: </label>' +
			'			<input type="text" class="rpht-long-input" id="pingPreviewInput" placeholder="Enter ping word to test"><br /><br />' +
			'			<label>Ping preview:</label><span id="pingPreviewText"></span>' +
			'	</div>' +
			'</div>' +
			'<h4>Auto Joining</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="joinFavEnable">Join favorites</label>' +
			'		<label class="switch"><input type="checkbox" id="joinFavEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Join rooms that are in the favorite rooms list</label>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<h4>Favorite Rooms</h4>' +
			'		<label class="rpht-label split-input-label">Username </label><select class="split-input-label" id="favUserDropList"></select><br /><br />' +
			'		<label class="rpht-label split-input-label">Room </label><input class="split-input-label" type="text" id="favRoom" name="favRoom"><br /><br />' +
			'		<label class="rpht-label split-input-label">Password</label><input class="split-input-label" type="text" id="favRoomPw" name="favRoomPw"><br /><br />' +
			'		<button style="width: 60px; float:right;" type="button" id="favAdd">Add</button><br /><br />' +
			'		<select style="width: 100%;" id="favRoomsList" size="10"></select><br><br>' +
			'		<button style="float:right;" type="button" id="favRemove">Remove</button><br />' +
			'	</div>' +
			'</div>'
	}

	const CHAT_COMMANDS = new function () {
		this.away = `<tr><td><code>/away [message]</code></td><td style="padding-bottom:10px;">Sets your status to "Away" and the status message<br>Example: <code>/away I'm away</code></td></tr>`
		this.coinflip = `<tr><td><code>/coinflip</code></td><td style="padding-bottom:10px;">Performs a coin flip</td></tr>`
		this.leave = `<tr><td><code>/leave</code></td><td style="padding-bottom:10px;">Leaves the current room</td></tr>`
		this.me = `<tr><td><code>/me</code></td><td style="padding-bottom:10px;">Formats text as an action</td></tr>`
		this.roll = `<tr><td><code>/roll [N]d[S]</code></td><td style="padding-bottom:10px;">Performs a dice roll with N die of S sides. For example /roll 3d12 will roll three, 12-sided die. Doing /roll by itself will default to 1d20</td></tr>`
		this.rps = `<tr><td><code>/rps</code></td><td style="padding-bottom:10px;">Performs a Rock/Paper/Scissors action</td></tr>`
		this.status = `<tr><td><code>/status [message]</code></td><td style="padding-bottom:10px;">Sets your status message<br>Example: <code>/status I'm tabbed out</code></td></tr>`
		this.kick = `<tr><td><code>/kick [username],[reason]</code></td><td style="padding-bottom:10px;">Kicks [username] from the current room with [reason] (optional)</td></tr>`
		this.ban = `<tr><td><code>/ban [username],[reason]</code></td><td style="padding-bottom:10px;">Bans [username] from the current room with [reason] (optional)</td></tr>`
		this['add-mod'] = `<tr><td><code>/add-mod [username]</code></td><td style="padding-bottom:10px;">Adds [username] as a mod of the current room</td></tr>`
		this['add-owner'] = `<tr><td><code>/add-onwer [username]</code></td><td style="padding-bottom:10px;">Adds [username] as the owner of the current room</td></tr>`
		this.unban = `<tr><td><code>/unban [username],[reason]</code></td><td style="padding-bottom:10px;">Unbans [username] from the current room with [reason] (optional)</td></tr>`
		this['remove-mod'] = `<tr><td><code>/remove-mod [username]</code></td><td style="padding-bottom:10px;">Removes [username] as a mod of the current room</td></tr>`
		this['remove-owner'] = `<tr><td><code>/remove-owner [username]</code></td><td style="padding-bottom:10px;">Removes [username] as the owner of the current room</td></tr>`
	}

	const CHAT_COMMAND_HTML = `<div id="chatCommandTooltip" class="rpht-cmd-tooltip"></div>`

	function init() {
		loadSettings()

		$('#chat-bottom').append(CHAT_COMMAND_HTML)
		$('#chatCommandTooltip').hide()

		/* General Options */
		$('#chatColorEnable').change(() => {
			chatSettings.colorText = $('#chatColorEnable').is(':checked')
			saveSettings()
		})

		$('#chatSimpleColorEnable').change(() => {
			chatSettings.colorSimpleText = $('#chatSimpleColorEnable').is(':checked')
			saveSettings()
		})

		$('#chatmsgPaddingEnable').change(() => {
			chatSettings.msgPadding = $('#chatmsgPaddingEnable').is(':checked')
			saveSettings()
		})

		$('#chatCmdPopupEnable').change(() => {
			chatSettings.chatCommandPopup = $('#chatCmdPopupEnable').is(':checked')

			if (!chatSettings.chatCommandPopup) {
				$('#chatCommandTooltip').hide()
			}
			saveSettings()
		})

		/* Pinging Options */
		$('#notifyPingEnable').change(() => {
			chatSettings.enablePings = $('#notifyPingEnable').is(':checked')
			saveSettings()
		})

		$('#notifyNotificationEnable').change(() => {
			chatSettings.pingNotify = $('#notifyNotificationEnable').is(':checked')
			saveSettings()
		})

		$('#selfPingEnable').change(() => {
			chatSettings.selfPing = $('#selfPingEnable').is(':checked')
			saveSettings()
		})

		$('#pingNotifyTimeoutSelect').change(() => {
			let timeoutHtml = $('#pingNotifyTimeoutSelect option:selected')
			chatSettings.notifyTime = parseInt(timeoutHtml.val())
			saveSettings()
		})

		$('#pingNames').blur(() => {
			var triggers = $('#pingNames').val().replace('\n', '').replace('\r', '')
			chatSettings.triggers = triggers
			saveSettings()
		})

		$('#pingURL').blur(() => {
			chatSettings.audioUrl = $('#pingURL').val()
			pingSound = new Audio(chatSettings.audioUrl)
			saveSettings()
		})

		$('#pingTextColor').blur(() => {
			let colorInput = $('#pingTextColor').val()
			if (validateColor(colorInput) === true) {
				chatSettings.color = colorInput
				saveSettings()
				markProblem('#pingHighlightColor', false)
			} else {
				markProblem('#pingHighlightColor', true)
			}
		})

		$('#pingHighlightColor').blur(() => {
			if (validateSetting('#pingHighlightColor', 'color') === true) {
				chatSettings.highlight = $('#pingHighlightColor').val()
				saveSettings()
			}
		})

		$('#pingBoldEnable').change(() => {
			chatSettings.bold = $('#pingBoldEnable').is(':checked')
			saveSettings()
		})

		$('#pingItalicsEnable').change(() => {
			chatSettings.italics = $('#pingItalicsEnable').is(':checked')
			saveSettings()
		})

		$('#pingExactMatch').change(() => {
			chatSettings.exact = $('#pingExactMatch').is(':checked')
			saveSettings()
		})

		$('#pingCaseSense').change(() => {
			chatSettings.case = $('#pingCaseSense').is(':checked')
			saveSettings()
		})

		$('#pingPreviewInput').blur(() => {
			var msg = $('#pingPreviewInput').val()
			var testRegex = matchPing(msg)
			if (testRegex !== null) {
				msg = highlightPing(msg, testRegex)
				pingSound.play()
				$('#pingPreviewText').html(`&nbsp;${msg}`)
			} else {
				$('#pingPreviewText').html(`No match`)
			}
		})

		/* Session Options */
		$('#joinFavEnable').click(() => {
			chatSettings.joinFavorites = $('#joinFavEnable').is(':checked')
			saveSettings()
		})

		$('#favAdd').click(() => {
			parseFavoriteRoom($('#favRoom').val())
			settingsModule.saveSettings(localStorageName, chatSettings)
		})

		$('#favRemove').click(() => {
			removeFavoriteRoom()
			settingsModule.saveSettings(localStorageName, chatSettings)
		})

		if (chatSettings.joinFavorites) {
			autoJoinTimer = setInterval(autoJoiningHandler, AUTOJOIN_INTERVAL)
		}

		/* General intialization */
		$(window).resize(resizeChatTabs)

		socket.on('confirm-room-join', function (data) {
			roomSetup(data)
		})

		/* Setup the timer for automatically dismissing the opening dialog once
		   rooms are available. The timer clears after. */
		autoDismissTimer = setInterval(() => {
			if (Object.keys(rph.rooms).length === 0) {
				return
			}
			$("button span:contains('Continue')").trigger('click')
			clearTimeout(autoDismissTimer)
		}, 500)

		socket.on('account-users', () => {
			setTimeout(() => {
				$('#favUserDropList').empty()
				var namesToIds = getSortedNames()
				for (var name in namesToIds) {
					addToDroplist(namesToIds[name], name, "#favUserDropList")
				}
			}, 3000)
		})
	}

	/**
	 * When user joins a room, do the following:
	 * - Set up the .onMessage function for pinging
	 * - Add the user's name to the chat tab and textarea
	 * - Create a room-pair name for the Modding section
	 * - Add the room the session.
	 * @param {object} room Room that the user has joined
	 */
	function roomSetup(room) {
		var thisRoom = getRoom(room.room)
		var userId = getIdFromChatTab(thisRoom)
		var moddingModule = rphToolsModule.getModule('Modding Module')
		let modUserIdx = -1

		thisRoom.$tabs[thisRoom.$tabs.length - 1].click(() => {
			for (let roomTab of thisRoom.$tabs) {
				roomTab.removeAttr('style')
			}
		})

		for (var idx = 0; idx < account.userids.length && !modUserIdx !== -1; idx++) {
			if (thisRoom.props.mods.indexOf(account.userids[idx]) > -1 ||
				thisRoom.props.owners.indexOf(account.userids[idx]) > -1) {
				modUserIdx = account.userids[idx]
				break
			}
		}

		socket.on('msg', (data) => {
			for (let dataIdx = 0; dataIdx < data.length; dataIdx++) {
				const msgData = data[(data.length - 1) - dataIdx]
				let messages = $(`div[data-roomname="${msgData.room}"]`).children()
				for (let idx = ((messages.length - 2) - dataIdx); idx > 0; idx--) {
					let message = messages[idx]
					if ($(message.children[0].children[0]).attr('data-userid') == msgData.userid) {
						processMsg(thisRoom, msgData, message, modUserIdx !== -1)
						break
					}
				}
			}
		})

		getUserById(userId, (User) => {
			if (moddingModule !== null && modUserIdx === userId) {
				moddingModule.addModRoomPair(User.props, thisRoom.props.name)
			}
			let roomCss = getCssRoomName(thisRoom.props.name)
			let chatTextArea = $(`textarea.${User.props.id}_${roomCss}`)
			let tabsLen = thisRoom.$tabs.length
			let idRoomName = thisRoom.$tabs[tabsLen - 1][0].className.split(' ')[2]
			thisRoom.$tabs[tabsLen - 1].prepend(`<p style="font-size: x-small; height:16px; margin-top: -14px;">${User.props.name}</p>`)
			$(`textarea.${idRoomName}`).prop('placeholder', `Post as ${User.props.name}`)
			$(`div.${User.props.id}_${roomCss} .user-for-textarea span`).css('overflow', 'hidden')
			chatTextArea.unbind('keyup')
			chatTextArea.bind('keydown', (ev) => {
				intputChatText(ev, User, thisRoom)
			})
			chatTextArea.on('input', () => {
				if (chatSettings.chatCommandPopup) {
					let chatInput = chatTextArea.val().trim()
					$('#chatCommandTooltip').hide()
					if (chatInput[0] === '/' && chatInput.indexOf(' ') === -1) {
						let commandTable = buildComamndTable(chatTextArea.val().trim())
						if (chatInput.length === 1 || commandTable.length > 0) {
							$('#chatCommandTooltip').html(commandTable)
							$('#chatCommandTooltip').show()
						}
					}
				}
			})
			resizeChatTabs()
		})
	}

	function processMsg(thisRoom, msgData, msgHtml, isMod) {
		let contentQuery = $(msgHtml.children[1].children[0])
		/* If the message was an action, switch the query to where it really is */
		if (msgHtml.className.includes('action')) {
			contentQuery = $(msgHtml.children[1].children[1])
		}
		/* Separate the new content from the previous content */
		const msgLineCount = msgData.msg.split('\n').length
		const contentLines = contentQuery[0].innerHTML.split('<br>')
		const prevMsgs = contentLines.slice(0, contentLines.length - msgLineCount)

		/* Add padding and remove stlying of the content */
		if (chatSettings.msgPadding && !$(msgHtml.children[1])[0].className.includes('msg-padding')) {
			$(msgHtml.children[1])[0].className += ' msg-padding'
			contentQuery.removeAttr('style')
		}

		if (!thisRoom.isActive() && msgData.room === thisRoom.props.name) {
			$(`li.tab.tab-${getCssRoomName(thisRoom.props.name)}`).css({
				'border-bottom': chatSettings.highlight,
				'4px solid #ADF': chatSettings.color
			})
			for (let roomTab of thisRoom.$tabs) {
				$(roomTab.children()[2]).hide()
			}
		}

		getUserById(msgData.userid, (user) => {
			const fadeTypes = ['', 'vertical-fade', 'horizontal-fade', 'radial-fade']
			const colorClasses = ['', 'two-color', 'three-color']
			const selfMsg = account.userids.includes(msgData.userid)
			let newMsgLines = contentLines.slice(contentLines.length - msgLineCount)

			for (let msgIdx = 0; msgIdx < newMsgLines.length; msgIdx++) {
				let chatCommand = parsePostCommand(newMsgLines[msgIdx])

				/* If the command is RNG, only process it if it's the first line as the seed is only good for that line. */
				if (chatCommand.includes('rng') && msgIdx === 0) {
					newMsgLines[msgIdx] = `[ ${user.props.name} ${generateRngResult(chatCommand, newMsgLines[msgIdx], msgData.time)} `
					newMsgLines[msgIdx] += ` <span style="background:#4A4; color: #FFF;"> &#9745;</span> ]`
				}
			}

			let newMsg = `${newMsgLines.join('<br>')}<br>`
			/* Add pings if 
			   - It's enabled AND 
			   - The message isn't a buffer from the server AND
			   - ((self pinging is enabled AND the message is owned by self) OR it's another's) */
			if (chatSettings.enablePings &&
				!msgData.buffer &&
				((chatSettings.selfPing && selfMsg === true) || selfMsg === false)) {
				let testRegex = null
				testRegex = matchPing(newMsg)
				if (testRegex) {
					newMsg = highlightPing(newMsg, testRegex)
					if (!thisRoom.isActive()) {
						$(`li.tab.tab-${getCssRoomName(thisRoom.props.name)}`).css({
							'background-color': chatSettings.highlight,
							'color': chatSettings.color
						})
					}
					pingSound.play()

					/* Bring up the notification if enabled, but don't do it if the user pinged themselves*/
					if (chatSettings.pingNotify && selfMsg === false && document.hidden) {
						let notification = new Notification(`${user.props.name} pinged you in ${thisRoom.props.name}`)
						setTimeout(() => {
							notification.close()
						}, chatSettings.notifyTime)
					}
				}
			}
			/* Process other's messages for issues if a mod */
			if (isMod && moddingModule && selfMsg === false) {
				let alertRegex = null
				let alertWords = moddingModule.getAlertWords()
				alertRegex = matchPing(newMsg, alertWords, false, true)
				// Process alert
				if (alertRegex) {
					msg = highlightPing(newMsg, alertRegex, true)
					if (!thisRoom.isActive()) {
						for (let roomTab of thisRoom.$tabs) {
							roomTab.css('background-color', '#F00')
							roomTab[0].css('color', '#FFF')
						}
					}
					moddingModule.playAlert()
				}
			}
			contentQuery.html(`${prevMsgs.join('<br>')} ${newMsg}`)

			if (chatSettings.colorText) {
				let classString = `${contentQuery[0].className}`
				let styleString = `color: #${user.props.color[0]};`

				if (user.props.color[1] && !chatSettings.colorSimpleText) {
					styleString += `--color1: #${user.props.color[0]}; --color2: #${user.props.color[1]};`
				}
				if (user.props.color[2] && !chatSettings.colorSimpleText) {
					styleString += `--color3: #${user.props.color[2]};`
				}

				if (!classString.includes(colorClasses[user.props.color.length - 1])) {
					classString += ` ${colorClasses[user.props.color.length - 1]}`
				}
				if (!classString.includes(fadeTypes[user.props.fade]) && !chatSettings.colorSimpleText) {
					classString += ` ${fadeTypes[user.props.fade]}`
				}

				contentQuery[0].className = classString.trim()
				contentQuery.attr('style', styleString)
			}
		})
	}

	function buildComamndTable(message) {
		let commandEntry = ''
		let commandTable = ''
		if (message.length === 1) {
			commandEntry = Object.values(CHAT_COMMANDS).join('\n')
		} else {
			const command = message.split(' ')[0].substring(1)
			Object.keys(CHAT_COMMANDS).filter(key => key.startsWith(command))
				.forEach(key => commandEntry += CHAT_COMMANDS[key])
		}
		if (commandEntry.length > 0) {
			commandTable = `<table style="width: 100%;">
					<tbody>
						<tr><td>Chat Commands:</td>	<td style="width: 68%;">&nbsp;</td></tr>
						${commandEntry}
					</tbody>
				</table>`
		}
		return commandTable
	}

	/**
	 * Parses a slash command from an input source.
	 * @param {object} inputTextBox HTML element that holds the input textbox
	 * @param {object} Room Room data
	 * @param {object} User User data
	 */
	function parseSlashCommand(inputTextBox, Room, User) {
		var newMessage = inputTextBox.val()
		var error = false
		var cmdArgs = newMessage.split(/ (.+)/)

		switch (cmdArgs[0]) {
			case '/status':
			case '/away':
				if (cmdArgs.length != 3) {
					error = true
				} else {
					var type = 0
					if (cmdArgs[0] === '/away') {
						type = 1
					}
					socket.emit('modify', {
						userid: User.props.id,
						statusMsg: cmdArgs[1],
						statusType: type
					})
					inputTextBox.val('')
				}
				break
			case '/rps':
				const results = ['Rock!', 'Paper!', 'Scissors!']
				newMessage = `/me plays Rock, Paper, Scissors and chooses... ${results[Math.ceil(Math.random() * 3) % 3].toString()}`
				Room.sendMessage(newMessage, User.props.id)
				break
			case '/leave':
				socket.emit('leave', {
					userid: User.props.id,
					name: Room.props.name
				})
				break
			case '/kick':
			case '/ban':
			case '/unban':
			case '/add-owner':
			case '/add-mod':
			case '/remove-owner':
			case '/remove-mod':
				var moddingModule = rphToolsModule.getModule('Modding Module')
				if (cmdArgs.length < 2) {
					error = true
				} else if (moddingModule) {
					var action = cmdArgs[0].substring(1, cmdArgs[0].length)
					var commaIdx = cmdArgs[1].indexOf(',')
					var targetName = cmdArgs[1]
					var reason = ''
					if (commaIdx > -1) {
						targetName = cmdArgs[1].substring(0, commaIdx)
						reason = cmdArgs[1].substring(commaIdx + 1, cmdArgs[1].length)
					}
					moddingModule.emitModAction(action, targetName, User.props.name,
						Room.props.name, reason)
					inputTextBox.val('')
				}
				break
			default:
				Room.sendMessage(newMessage, User.props.id)
				break
		}

		if (error) {
			Room.appendMessage(
				'<span class="first">&nbsp;</span><span title="' +
				makeTimestamp(false, true) + '">Error in command input</span>'
			).addClass('sys')
		}
	}

	/**
	 * 
	 * @param {object} ev - Event
	 * @param {object} User - User the textbox is attached to
	 * @param {oject} Room - Room the textbox is attached to
	 */
	function intputChatText(ev, User, Room) {
		let inputTextarea = $(`textarea.${User.props.id}_${getCssRoomName(Room.props.name)}.active`)
		let message = inputTextarea.val().trim()

		if (message.length > 4000) {
			Room.appendMessage(
				`<span class="first">&nbsp;</span><span title="${makeTimestamp(null, true)}">Message too long</span>`
			).addClass('sys')
			return
		} else if (message.length === 0) {
			return
		} else if (ev.keyCode !== 13 || ev.shiftKey === true || ev.ctrlKey === true) {
			return
		}

		$('#chatCommandTooltip').hide()
		if (!floodTracker(User, Room, message)) {
			if (message[0] === '/' && message.substring(0, 2) !== '//' && chatModule) {
				chatModule.parseSlashCommand(inputTextarea, Room, User);
			} else {
				Room.sendMessage(message, User.props.id)
			}
			inputTextarea.val('')
		}
	}

	/**
	 * Checks if the message has any ping terms
	 * @param {string} msg - The message for the chat
	 * @returns Returns the match or null
	 */
	function matchPing(msg, triggers = chatSettings.triggers, caseSensitive = chatSettings.case, exactMatch = chatSettings.exact) {
		if (triggers.length === 0) {
			return
		}
		let result = null
		let pingNames = triggers.split(',')
		let regexParam = (caseSensitive ? "m" : 'im')
		for (i = 0; i < pingNames.length; i++) {
			let trigger = pingNames[i].trim()
			if (trigger === "") {
				continue
			}
			let regexPattern = (exactMatch) ? `\\b${trigger}\\b` : trigger
			let urlRegex = new RegExp(`href=".*?${trigger}.*?"`, '')
			let testRegex = new RegExp(regexPattern, regexParam)
			/* Check if search term is not in a link as well */
			if (!urlRegex.test(msg) && testRegex.test(msg)) {
				result = testRegex
				break
			}
		}
		return result
	}

	/**
	 * Adds highlights to the ping term
	 * @param {string} msg - Message to be sent to the www.
	 * @param {regex} testRegex - Regular expression to use to match the term.
	 * @returns Modified message
	 */
	function highlightPing(msg, testRegex, alert = false) {
		if (alert) {
			msg = msg.replace(testRegex, `<span class="alert-ping">${msg.match(testRegex)}</span>`)
		} else {
			let styleText = `color: ${chatSettings.color}; background: ${chatSettings.highlight};`

			if (chatSettings.bold === true) {
				styleText += ' font-weight: bold;'
			}
			if (chatSettings.italics === true) {
				styleText += ' font-style:italic;'
			}
			msg = msg.replace(testRegex, `<span style="${styleText}">${msg.match(testRegex)}</span>`)
		}
		return msg
	}

	/**
	 * Gets the user's ID from the chat tab (it's in the class)
	 * @param {} thisRoom - Room to get the ID from
	 **/
	function getIdFromChatTab(thisRoom) {
		var tabsLen = thisRoom.$tabs.length
		var className = thisRoom.$tabs[tabsLen - 1][0].className
		var charID = className.match(new RegExp(' [0-9]+', ''))[0]
		charID = charID.substring(1, charID.length)
		return parseInt(charID)
	}

	/**
	 * Resizes chat tabs based on the width of the tabs vs. the screen size.
	 */
	function resizeChatTabs() {
		$('#chat-tabs').addClass('rpht_chat_tab')
		/* Window is smaller than the tabs width */
		if ($('#chat-tabs')[0].clientWidth < $('#chat-tabs')[0].scrollWidth ||
			$('#chat-tabs')[0].clientWidth > $('#chat-bottom')[0].clientWidth) {
			$('#chat-top').css('padding-bottom', '136px')
			$('#chat-bottom').css('margin-top', '-138px')
		} else {
			$('#chat-top').css('padding-bottom', '120px')
			$('#chat-bottom').css('margin-top', '-118px')
		}
		// Debouce the function.
		$(window).off("resize", resizeChatTabs)
		setTimeout(() => {
			$(window).resize(resizeChatTabs)
		}, 100)
	}

	/** AUTO JOINING FUNCTIONS **********************************************/
	/**
	 * Handler for the auto-joining mechanism.
	 **/
	function autoJoiningHandler() {
		/* Don't run this if there's no rooms yet. */
		if (Object.keys(rph.rooms).length === 0) {
			return
		}
		$('<div id="rpht-autojoin" class="inner">' +
			'<p>Autojoining or restoring session.</p>' +
			'<p>Press "Cancel" to stop autojoin or session restore.</p>' +
			'</div>'
		).dialog({
			open: function (event, ui) {
				setTimeout(() => {
					$('#rpht-autojoin').dialog('close')
				}, AUTOJOIN_TIMEOUT_SEC)
			},
			buttons: {
				Cancel: () => {
					clearTimeout(autoJoinTimer)
					$('#rpht-autojoin').dialog('close')
				}
			},
		}).dialog('open')

		clearTimeout(autoJoinTimer)
		autoJoinTimer = setTimeout(joinRooms, AUTOJOIN_TIMEOUT_SEC)
	}

	/**
	 * Join rooms in the favorites and what was in the session.
	 */
	function joinRooms() {
		if (chatSettings.joinFavorites === true) {
			joinFavoriteRooms()
		}
	}

	/** 
	 * Joins all the rooms in the favorite rooms list
	 */
	function joinFavoriteRooms() {
		for (var i = 0; i < chatSettings.favRooms.length; i++) {
			var favRoom = chatSettings.favRooms[i]
			socket.emit('join', {
				name: favRoom.room,
				userid: favRoom.userId,
				pw: favRoom.roomPw
			})
		}
	}

	/** 
	 * Adds an entry to the Favorite Chat Rooms list from an input
	 * @param {string} roomname - Name of the room
	 */
	function parseFavoriteRoom(roomname) {
		var room = getRoom(roomname)
		if (room === undefined) {
			markProblem('favRoom', true)
			return
		}
		if (chatSettings.favRooms.length < MAX_ROOMS) {
			var selectedFav = $('#favUserDropList option:selected')
			var hashStr = $('#favRoom').val() + selectedFav.html()
			var favRoomObj = {
				_id: hashStr.hashCode(),
				user: selectedFav.html(),
				userId: parseInt(selectedFav.val()),
				room: $('#favRoom').val(),
				roomPw: $('#favRoomPw').val()
			}
			addFavoriteRoom(favRoomObj)
			markProblem('favRoom', false)
		}
	}

	/**
	 * Adds a favorite room to the settings list
	 * @param {Object} favRoomObj - Object containing the favorite room parameters.
	 */
	function addFavoriteRoom(favRoomObj) {
		if (arrayObjectIndexOf(chatSettings.favRooms, "_id", favRoomObj._id) === -1) {
			$('#favRoomsList').append(
				'<option value="' + favRoomObj._id + '">' +
				favRoomObj.user + ": " + favRoomObj.room + '</option>'
			)
			chatSettings.favRooms.push(favRoomObj)
		}
		if (chatSettings.favRooms.length >= MAX_ROOMS) {
			$('#favAdd').text("Favorites Full")
			$('#favAdd')[0].disabled = true
		}
	}

	/** 
	 * Removes an entry to the Favorite Chat Rooms list
	 */
	function removeFavoriteRoom() {
		var favItem = document.getElementById("favRoomsList")
		var favItemId = $('#favRoomsList option:selected').val()
		favItem.remove(favItem.selectedIndex)
		for (var idx = 0; idx < chatSettings.favRooms.length; idx++) {
			if (chatSettings.favRooms[idx]._id == favItemId) {
				chatSettings.favRooms.splice(idx, 1)
				break
			}
		}
		if (chatSettings.favRooms.length < 10) {
			$('#favAdd').text("Add")
			$('#favAdd')[0].disabled = false
		}
	}

	/**
	 * Save current settings
	 */
	function saveSettings() {
		settingsModule.saveSettings(localStorageName, chatSettings)
	}
	/**
	 * Loads settings from local storage
	 * @param {object} storedSettings Object containing the settings
	 */
	function loadSettings() {
		let storedSettings = settingsModule.getSettings(localStorageName)
		chatSettings = {
			'colorText': true,
			'colorSimpleText': true,
			'msgPadding': false,
			'chatCommandPopup': true,

			'enablePings': true,
			'pingNotify': false,
			'selfPing': true,
			'notifyTime': 6000,
			'triggers': [],
			'audioUrl': 'https://www.rphaven.com/sounds/boop.mp3',
			'color': '#000',
			'highlight': '#FFA',
			'bold': false,
			'italics': false,
			'exact': false,
			'case': false,

			'joinFavorites': false,
			'favRooms': [],
		}
		if (storedSettings) {
			chatSettings = Object.assign(chatSettings, storedSettings)
		}

		$('#chatColorEnable').prop("checked", chatSettings.colorText)
		$('#chatSimpleColorEnable').prop("checked", chatSettings.colorSimpleText)
		$('#chatmsgPaddingEnable').prop("checked", chatSettings.msgPadding)
		$('#chatCmdPopupEnable').prop("checked", chatSettings.chatCommandPopup)

		$('#notifyPingEnable').prop("checked", chatSettings.enablePings)
		$('#notifyNotificationEnable').prop("checked", chatSettings.pingNotify)
		$('#pingNames').val(chatSettings.triggers)
		$('#pingURL').val(chatSettings.audioUrl)
		$('#pingTextColor').val(chatSettings.color)
		$('#pingHighlightColor').val(chatSettings.highlight)
		$('input#pingBoldEnable').prop("checked", chatSettings.bold)
		$('input#pingItalicsEnable').prop("checked", chatSettings.italics)
		$('input#pingExactMatch').prop("checked", chatSettings.exact)
		$('input#pingCaseSense').prop("checked", chatSettings.case)

		$('#joinFavEnable').prop("checked", chatSettings.joinFavorites)
		for (var i = 0; i < chatSettings.favRooms.length; i++) {
			var favRoomObj = chatSettings.favRooms[i]
			$('#favRoomsList').append(
				'<option value="' + favRoomObj._id + '">' +
				favRoomObj.user + ": " + favRoomObj.room + '</option>'
			)
		}
		pingSound = new Audio(chatSettings.audioUrl)
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'Chat Module'
	}

	return {
		init: init,
		parseSlashCommand: parseSlashCommand,
		loadSettings: loadSettings,
		getHtml: getHtml,
		toString: toString
	}
}());/**
 * This module handles features for the PM system.
 */
var pmModule = (function () {
	var pmSettings = {}

	var localStorageName = "pmSettings"

	var html = {
		'tabId': 'pm-module',
		'tabName': 'PMs',
		'tabContents': 
			'<h3>PM Settings</h3><br>' +
			'<h4>General options</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<label class="rpht-label checkbox-label" for="pmColorEnable">Use user text colors</label>' +
			'		<label class="switch"><input type="checkbox" id="pmColorEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Use the user\'s color to stylize their text</label>' +
			'	</div>' +
			'</div>' +
			'<h4>PM Notification Settings</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="pmNotify">Enable desktop notifications</label>' +
			'		<label class="switch"><input type="checkbox" id="pmNotify"><span class="rpht-slider round"></span></label>' +
			'		<p>Pops a desktop notification when you get a PM</p>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label style="font-weight: bold; width:522px; padding: 0px;">Desktop notification duration</label>' +
			'		<select style="width: 80px; float: right;" id="pmNotifyTimeoutSelect">' +
			'			<option value="3000">Short</option>' +
			'			<option value="6000" selected>Normal</option>' +
			'			<option value="10000">Long</option>' +
			'		</select>' +
			'		<label class="rpht-label descript-label">How long the notification will stay up</label>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<label class="rpht-label split-input-label">PM sound URL </label>' +
			'		<input class="split-input-label" type="text" id="pmPingURL" name="pmPingURL" style="margin-bottom: 12px;">' +
			'		<label class="rpht-label checkbox-label" for="pmMute">Mute PMs</label>' +
			'		<label class="switch"><input type="checkbox" id="pmMute"><span class="rpht-slider round"></span></label>' +
			'	</div>' +
			'</div>' +
			'<h4>PM Away System</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<p>Usernames</p>' +
			'		<select style="width: 100%;" id="pmNamesDroplist" size="10"></select><br><br>' +
			'		<label><strong>Away Message </strong></label><input type="text" class="rpht-long-input" id="awayMessageTextbox" maxlength="300" placeholder="Away message...">' +
			'		<br><br>' +
			'		<button type="button" style="float:right; width:60px" id="setAwayButton">Enable</button>' +
			'		<button type="button" style="float:right; margin-right: 20px; width:60px" id="removeAwayButton">Disable</button>' +
			'	</div>' +
			'</div>'
	}

	var awayMessages = {}

	function init() {
		loadSettings()

		$('#pmColorEnable').change(() => {
			pmSettings.colorText = $('#pmColorEnable').is(':checked')
			settingsModule.saveSettings(localStorageName, pmSettings)
		})

		$('#pmNotify').change(() => {
			pmSettings.notify = $('#pmNotify').is(':checked')
			settingsModule.saveSettings(localStorageName, pmSettings)
		})

		$('#pmNotifyTimeoutSelect').change(() => {
			let timeoutHtml = $('#pmNotifyTimeoutSelect option:selected')
			pmSettings.notifyTime = parseInt(timeoutHtml.val())
			settingsModule.saveSettings(localStorageName, pmSettings)
		})
		
		$('#pmNamesDroplist').change(() => {
			var userId = $('#pmNamesDroplist option:selected').val()
			var message = ''

			if (awayMessages[userId] !== undefined) {
				message = awayMessages[userId].message
			}
			$('input#awayMessageTextbox').val(message)
		})

		$('#setAwayButton').click(() => {
			setPmAway()
		})

		$('#removeAwayButton').click(() => {
			removePmAway($('#pmNamesDroplist option:selected').val())
		})

		$('#pmPingURL').change(() => {
			if (validateSetting('pmPingURL', 'url')) {
				pmSettings.audioUrl = $('pmPingURL').val()
				$('#im-sound').children("audio").attr('src', pmSettings.audioUrl)
				settingsModule.saveSettings(localStorageName, pmSettings)
			}
		})

		$('#pmMute').change(() => {
			if ($('#pmMute').is(":checked")) {
				$('#im-sound').children("audio").attr('src', '')
				pmSettings.pmMute = true
			} else {
				$('#im-sound').children("audio").attr('src', pmSettings.audioUrl)
				pmSettings.pmMute = false
			}
			settingsModule.saveSettings(localStorageName, pmSettings)
		})

		$('#pmNotify').change(() => {
			pmSettings.notify = $('#pmNotify').is(":checked")
			settingsModule.saveSettings(localStorageName, pmSettings)
		})
		$('#pm-msgs span').css('opacity', 0.85)

		socket.on('pm', (data) => {
			if (account.ignores.indexOf(data.to) > -1) {
				return;
			}
			rph.getPm({'from':data.from, 'to':data.to}, (pm) => {
				getUserByName(pm.to.props.name, (user) => {
					processPmMsg(user, data, pm)
				})

				if (pmSettings.notify && document.hidden) {
					let notification = new Notification(`${pm.to.props.name} sent a PM to you for ${pm.from.props.name}`)
					setTimeout(() => {
						notification.close()
					}, pmSettings.notifyTime)
				}

				if (awayMessages[data.from] && awayMessages[data.from].enabled) {
					awayMessages[data.from].usedPmAwayMsg = true;
					socket.emit('pm', {
					  'from': data.from,
					  'to': data.to,
					  'msg': awayMessages[data.from].message,
					  'target': 'all'
					});
				  }
			})
		})
		
		socket.on('pm-confirmation', (data) => {
			rph.getPm({'from':data.to, 'to':data.from}, function(pm){
				getUserByName(pm.from.props.name, (user) => {
					processPmMsg(user, data, pm)

					if (awayMessages[data.to] && awayMessages[data.to].enabled) {
						$('#pmNamesDroplist option').filter(function () {
							return this.value == data.to
						  })
						  .css("background-color", "")
						  .html(user.props.name)
						  awayMessages[data.to].enabled = false
					}
				})
			})
		})

		socket.on('account-users', () => {
			setTimeout(() => {
				$('#pmNamesDroplist').empty()
				var namesToIds = getSortedNames()
				for (var name in namesToIds) {
					addToDroplist(namesToIds[name], name, "#pmNamesDroplist")
				}
			}, 3000)
		})
	}
	function processPmMsg(user, data, pm) {
		let pmMsgQuery = pm.$msgs[0].childNodes[pm.$msgs[0].childNodes.length - 1]
		let nameQuery = $(pmMsgQuery.childNodes[1].childNodes[1])
		let msgQuery = $(pmMsgQuery.childNodes[1].childNodes[2])
		let pmCommand = parsePostCommand(data.msg)

		if (pmCommand.includes('rng')) {
			msgQuery[0].innerHTML = ` ${generateRngResult(pmCommand, data.msg, data.date)} <span style="background:#4A4; color: #FFF;"> &#9745; </span>`
			nameQuery[0].innerHTML = `${user.props.name}`
		}
		else if (pmCommand === 'me') {
			nameQuery[0].innerHTML = `${user.props.name} `
		}
		else {
			nameQuery.html(`&nbsp;${user.props.name}:&nbsp;`)
		}
	
		nameQuery.attr('style', `color: #${user.props.color[0]}`)
		if (pmSettings.colorText) {
			msgQuery.attr('style', `color: #${user.props.color[0]}`)
		}
	}

	/**
	 * Adds an away status to a character
	 */
	function setPmAway() {
		var userId = $('#pmNamesDroplist option:selected').val()
		var name = $("#pmNamesDroplist option:selected").html()
		if (!awayMessages[userId]) {
			var awayMsgObj = {
				"usedPmAwayMsg": false,
				"message": "",
				"enabled": false
			}
			awayMessages[userId] = awayMsgObj
		}

		if (!awayMessages[userId].enabled) {
			$("#pmNamesDroplist option:selected").html("[Away]" + name)
		}
		awayMessages[userId].enabled = true
		awayMessages[userId].message = $('input#awayMessageTextbox').val()
		$("#pmNamesDroplist option:selected").css("background-color", "#FFD800")
		$("#pmNamesDroplist option:selected").prop("selected", false)

		console.log('RPH Tools[setPmAway]: Setting away message for',
			name, 'with message', awayMessages[userId].message)
	}

	/**
	 * Removes an away status for a character
	 */
	function removePmAway(userId) {
		if (!awayMessages[userId]) {
			return
		}
		var name = $("#pmNamesDroplist option:selected").html()
		if (awayMessages[userId].enabled && name.startsWith('[Away]')) {
			awayMessages[userId].enabled = false
			$("#pmNamesDroplist option:selected").html(name.substring(6, name.length))
			$("#pmNamesDroplist option:selected").css("background-color", "")
			$('input#awayMessageTextbox').val("")
			console.log('RPH Tools[removePmAway]: Remove away message for', name)
		}
	}

	function loadSettings() {
		var storedSettings = settingsModule.getSettings(localStorageName)
		pmSettings = {
			'colorText': false,
			'notify': false,
			'notifyTime': 6000,
			'audioUrl': 'https://www.rphaven.com/sounds/imsound.mp3',
			'pmMute': false,
		}

		if (storedSettings) {
			pmSettings = Object.assign(pmSettings, storedSettings)
		} 

		$('#pmColorEnable').prop("checked", pmSettings.colorText)
		$('#pmNotify').prop("checked", pmSettings.notify)
		$('#pmNotifyTimeoutSelect').val(pmSettings.notifyTime.toString())
		$('#pmPingURL').val(pmSettings.audioUrl)
		$('#pmMute').prop("checked", pmSettings.pmMute)
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'PM Module'
	}

	return {
		init: init,
		loadSettings: loadSettings,
		getHtml: getHtml,
		toString: toString
	}
}());/**
 * This module handles chat modding features. These include an easier way to
 * issue kicks, bans, promotions and demotions. It also can set up monitoring
 * of certain words and alert the mod.
 */
var moddingModule = (function () {
	var settings = {
		'alertWords': '',
		'alertUrl': 'https://www.rphaven.com/sounds/boop.mp3',
	}

	var localStorageName = "modSettings"

	var html = {
		'tabId': 'modding-module',
		'tabName': 'Modding',
		'tabContents':
			'<h3>Moderator Control</h3><br>' +
			'<h4>Shortcuts</h4>' +
			'<div class="rpht-option-block">' +
			'	<p><strong>Note:</strong> This must be done with the mods chat tab selected.</p>' +
			'	<p>General form: <code>/[action] [username],[reason]</code>. The reason is optional.</p>' +
			'	<p>Example: <code>/kick Alice,Being rude</code></p>' +
			'	<p>Supported actions: kick, ban, unban, add-mod, remove-mod, add-owner, remove-owner</p>' +
			'</div>' +
			'<h4>Mod commands</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label split-input-label">Room-Name pair</label>' +
			'		<select class="split-input-label" id="roomModSelect"><option value="">&lt;Blank out fields&gt;</option></select><br /><br />' +
			'		<label class="rpht-label split-input-label">Room:</label><input class="split-input-label" type="text" id="modRoomTextInput" placeholder="Room"><br /><br />' +
			'		<label class="rpht-label split-input-label">Mod name:</label><input class="split-input-label" type="text" id="modFromTextInput" placeholder="Your mod name"><br /><br />' +
			'		<label class="rpht-label split-input-label">Reason Message:</label><input class="split-input-label" type="text" id="modMessageTextInput" placeholder="Message"><br /><br />' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<p>Perform action on these users (comma separated): </p>' +
			'		<textarea name="modTargetTextInput" id="modTargetTextInput" rows=2 class="rpht_textarea"></textarea>' +
			'		<br /><br />' +
			'		<table style="width: 600px;" cellpadding="2">' +
			'			<tbody>' +
			'				<tr>' +
			'					<td valign="top">' +
			'						<button style="width: 60px;" type="button" id="kickButton">Kick</button>' +
			'					</td>' +
			'					<td>' +
			'						<button style="width: 60px; margin-bottom: 8px;" type="button" id="banButton">Ban</button><br />' +
			'						<button style="width: 60px;" type="button" id="unbanButton">Unban</button>' +
			'					</td>' +
			'					<td>' +
			'						<button style="width: 60px; margin-bottom: 8px;" type="button" id="modButton">Mod</button><br>' +
			'						<button style="width: 60px;" type="button" id="unmodButton">Unmod</button>' +
			'					</td>' +
			'					<td>' +
			'						<button style="width: 80px; margin-bottom: 8px;" type="button" id="OwnButton">Owner</button><br>' +
			'						<button style="width: 80px;" type="button" id="UnownButton">Unowner</button>' +
			'					</td>' +
			'				</tr>' +
			'			</tbody>' +
			'		</table>' +
			'		<br><br>' +
			'		<button type="button" id="resetPwButton">Reset PW</button>' +
			'	</div>' +
			'</div>' +
			'<h4>Word Alert</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="wordAlertEnable">Enable word alerting</label>' +
			'		<label class="switch"><input type="checkbox" id="wordAlertEnable"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Highlights words that you want to be pinged on for moderation</label>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<p><strong>Note:</strong> Separate all entries with a pipe character ( | ).</p>' +
			'		<textarea name="alertTriggers" id="alertTriggers" rows=4 class="rpht_textarea"></textarea>' +
			'	</div>' +
			'</div>'
	}

	var alertSound = null

	var roomNamePairs = {}

	function init() {
		loadSettings()
		
		$('#roomModSelect').change(function () {
			var roomModeIdx = $('#roomModSelect')[0].selectedIndex
			var roomModVal = $('#roomModSelect')[0].options[roomModeIdx].value
			if (roomNamePairs[roomModVal]) {
				$('input#modRoomTextInput').val(roomNamePairs[roomModVal].roomName)
				$('input#modFromTextInput').val(roomNamePairs[roomModVal].modName)
			} else {
				$('input#modRoomTextInput').val("")
				$('input#modFromTextInput').val("")
			}
		})

		$('#resetPwButton').click(function () {
			var room = $('input#modRoomTextInput').val()

			getUserByName($('input#modFromTextInput').val(), function (user) {
				socket.emit('modify', {
					room: room,
					userid: user.props.id,
					props: {
						pw: false
					}
				})
			})
		})

		$('#kickButton').click(function () {
			modAction('kick')
		})

		$('#banButton').click(function () {
			modAction('ban')
		})

		$('#unbanButton').click(function () {
			modAction('unban')
		})

		$('#modButton').click(function () {
			modAction('add-mod')
		})

		$('#unmodButton').click(function () {
			modAction('remove-mod')
		})

		$('#OwnButton').click(function () {
			modAction('add-owner')
		})

		$('#UnOwnButton').click(function () {
			modAction('remove-owner')
		})

		$('#modAlertWords').blur(function () {
			settings.alertWords = $('#modAlertWords').val().replace(/\r?\n|\r/, '')
			settingsModule.saveSettings(localStorageName, settings)
		})

		$('#modAlertUrl').blur(function () {
			if (validateSetting('modAlertUrl', 'url')) {
				settings.alertUrl = $('#modAlertUrl').val()
				settingsModule.saveSettings(localStorageName, settings)
				alertSound = new Audio(settings.alertUrl)
			}
		})

		$('#alertTriggers').blur(function () {
			settings.alertWords = $('#alertTriggers').val()
			settingsModule.saveSettings(localStorageName, settings)
		})
	}

	/**
	 * Performs a modding action. This will look for a user's vanity name first, then act on that.
	 * @param {string} action Name of the action being performed
	 */
	function modAction(action) {
		var targets = $('#modTargetTextInput').val().replace(/\r?\n|\r/, '')
		let vanityMap = getVanityNamesToIds()
		targets = targets.split(',')
		console.log('RPH Tools[modAction]: Performing', action, 'on', targets)
		targets.forEach(function (target) {
			if (vanityMap[target]) {
				target = messenger.users[vanityMap[target]].props.name
			}
			emitModAction(action, target, $('input#modFromTextInput').val(),
				$('input#modRoomTextInput').val(),
				$("input#modMessageTextInput").val())
		})
	}

	/**
	 * Sends off the mod action to the chat socket
	 * @param {string} action Name of the action being performed
	 * @param {string} targetName User name of the recipient of the action
	 */
	function emitModAction(action, targetName, modName, roomName, reasonMsg) {
		getUserByName(targetName, function (target) {
			getUserByName(modName, function (user) {
				var modMessage = ''
				if (action === 'kick' || action === 'ban' || action === 'unban') {
					modMessage = reasonMsg
				}
				socket.emit(action, {
					room: roomName,
					userid: user.props.id,
					targetid: target.props.id,
					msg: modMessage
				})
			})
		})
	}

	function findUserAsMod(userObj) {
		Object.keys(rph.rooms).forEach((roomname) => {
			var roomObj = getRoom(roomname)
			if (roomObj.props.mods.indexOf(userObj.props.id) > -1 ||
				roomObj.props.owners.indexOf(userObj.props.id) > -1) {
				addModRoomPair(userObj.props, roomname)
			}
		})
	}

	/**
	 * Adds a key/value pair option to the Room-Name Pair droplist.
	 * @param {number} userId User ID of the mod
	 * @param {object} thisRoom Object containing the room data.
	 */
	function addModRoomPair(userProps, roomName) {
		var roomNamePair = roomName + ': ' + userProps.name
		var roomNameValue = roomName + '.' + userProps.id
		var roomNameObj = {
			'roomName': roomName,
			'modName': userProps.name,
			'modId': userProps.id
		}

		if (roomNamePairs[roomNameValue] === undefined) {
			roomNamePairs[roomNameValue] = roomNameObj
			$('#roomModSelect').append('<option value="' + roomNameValue + '">' +
				roomNamePair + '</option>')
		}
	}

	/**
	 * Plays the alert sound
	 */
	function playAlert() {
		alertSound.play()
	}

	function loadSettings() {
		var storedSettings = settingsModule.getSettings(localStorageName)
		if (storedSettings) {
			settings = storedSettings
		}
		else {
			settings = {
				'alertWords': '',
				'alertUrl': 'https://www.rphaven.com/sounds/boop.mp3',
			}
		}

		$('#modAlertUrl').val(settings.alertUrl)
		alertSound = new Audio(settings.alertUrl)

		$('#alertTriggers').val(settings.alertWords)
	}

	function getAlertWords() {
		return settings.alertWords
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'Modding Module'
	}

	return {
		init: init,
		emitModAction: emitModAction,
		findUserAsMod: findUserAsMod,
		addModRoomPair: addModRoomPair,
		playAlert: playAlert,
		loadSettings: loadSettings,
		getAlertWords: getAlertWords,
		getHtml: getHtml,
		toString: toString
	}
}());/**
 * Handles importing, exporting, and deleting of settings.
 */
var settingsModule = (function () {
	var html = {
		'tabId': 'settings-module',
		'tabName': 'Settings',
		'tabContents': '<h3>Script Settings</h3><br>' +
			'<p>Press "Export" to export savable settings. To import settings, paste them into the text box and press "Import".</p>' +
			'<textarea name="importExportText" id="importExportTextarea" rows=10 class="rpht_textarea"></textarea>' +
			'<br /><br />' +
			'<button type="button" style="width: 60px;" id="exportButton">Export</button>' +
			'<button type="button" style="margin-left: 10px; width: 60px;" id="importButton">Import</button>' +
			'<button type="button" style="margin-left: 376px; " id="deleteSettingsButton">Delete settings</button>'
	}

	var confirmDelete = false

	var deleteTimer = null

	/** 
	 * Initializes the GUI components of the module.
	 */
	function init() {
		if (!localStorage.getItem(SETTINGS_NAME)){
			localStorage.setItem(SETTINGS_NAME, JSON.stringify({}))
		}
		$('#importButton').click(function () {
			importSettingsHanlder()
		})

		$('#exportButton').click(function () {
			$('textarea#importExportTextarea').val(exportSettings())
		})

		$('#printSettingsButton').click(function () {
			printSettings()
		})

		$('#deleteSettingsButton').click(function () {
			deleteSettingsHanlder()
		})
	}

	/**
	 * Handles the initial portion of importing settings. This checks the input
	 * to see if it's a valid JSON formatted string.
	 */
	function importSettingsHanlder() {
		try {
			var newSettings = JSON.parse($('textarea#importExportTextarea').val())
			localStorage.setItem(SETTINGS_NAME, JSON.stringify(newSettings))
			rphToolsModule.getAllModules().forEach((module) => {
				if (module.loadSettings){
					module.loadSettings()
				}
			})
		}
		catch {
			console.log('[RPHT.Settings]: There was a problem with importing settings')
			markProblem('textarea#importExportTextarea', true)
		}
	}

	/**
	 * Exports settings into a JSON formatted string
	 */
	function exportSettings() {
		return localStorage.getItem(SETTINGS_NAME)
	}

	/** 
	 * Logic to confirm deleting settings. The button needs to be pressed twice
	 * within 10 seconds for the settings to be deleted.
	 */
	function deleteSettingsHanlder() {
		if (confirmDelete === false) {
			$('#deleteSettingsButton').text('Press again to delete')
			confirmDelete = true

			/* Set a timeout to make "confirmDelete" false automatically */
			deleteTimer = setTimeout(function () {
				confirmDelete = false
				$('#deleteSettingsButton').text('Delete Settings')
			}, 10 * 1000)
		} else if (confirmDelete === true) {
			clearTimeout(deleteTimer)
			console.log('RPH Tools[Settings Module]: Deleting settings')
			$('#deleteSettingsButton').text('Delete Settings')
			confirmDelete = false
			localStorage.removeItem(SETTINGS_NAME)
			localStorage.setItem(SETTINGS_NAME, JSON.stringify({}))
			rphToolsModule.getAllModules().forEach((module) => {
				if (module.loadSettings){
					console.log(`RPH Tools[Settings Module]: ${module.toString()}`)
					module.loadSettings()
				}
			})
		}
	}

	function saveSettings(moduleName, moduleSettings) {
		var settings = JSON.parse(localStorage.getItem(SETTINGS_NAME))
		settings[moduleName] = {}
		settings[moduleName] = moduleSettings
		localStorage.setItem(SETTINGS_NAME, JSON.stringify(settings))
	}

	function getSettings(moduleName) {
		var settings = JSON.parse(localStorage.getItem(SETTINGS_NAME))
		var moduleSettings = null
		if (settings[moduleName]) {
			moduleSettings = settings[moduleName]
		}
		return moduleSettings
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'Settings Module'
	}

	/** 
	 * Public members of the module
	 */
	return {
		init: init,
		saveSettings: saveSettings,
		getSettings: getSettings,
		getHtml: getHtml,
		toString: toString
	}
}());/**
 * This module handles the "About" section for information on RPH Tools.
 */
var aboutModule = (function () {
	var html = {
		'tabId': 'about-module',
		'tabName': 'About',
		'tabContents': '<h3>RPH Tools</h3><br>' +
			'<p><strong>Version: ' + VERSION_STRING + '</strong>' +
			' | <a href="https://github.com/shuffyiosys/rph-tools/blob/master/CHANGELOG.md" target="_blank">Version history</a>' +
			' | <a href="https://openuserjs.org/install/shuffyiosys/RPH_Tools.user.js" target="_blank">Install the latest version</a>' +
			' | <a href="https://discord.gg/HBEaGjs" target="_blank">Discord channel</a>' + 
			'</p></br>' +
			'<p>Created by shuffyiosys. Under MIT License (SPDX: MIT). Feel free to make contributions to <a href="https://github.com/shuffyiosys/rph-tools" target="_blank">the repo</a>!</p><br />' +
			'<p><a href="https://github.com/shuffyiosys/rph-tools/blob/master/docs/quick-guide.md" target="_blank">Quick guide to using RPH Tools</a></p></br>' +
			'<p>If the script isn\'t working, try some <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target="_blank">Troubleshooting Tips</a></p><br />'
	}

	function init() {
		return
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'About Module'
	}

	return {
		init: init,
		getHtml: getHtml,
		toString: toString
	}
}());/**
 * Main RPH Tools module
 */
var rphToolsModule = (function () {
	var modules = []

	var rpht_css =
		'<style>' +
		'#settings-dialog .inner > div > div.rpht-option-block{width:640px;border:#888 solid 1px;border-radius:10px;padding:12px;padding-top:16px;padding-bottom:16px;margin-bottom:16px;}' +
		'.rpht-option-section{border-bottom:#444 solid 1px;padding-bottom:12px;margin-bottom:12px;}' +
		'.option-section-bottom{border-bottom:none;margin-bottom:0;}' +
		'.rpht-label{padding-left: 0px;text-align:justify;display:inline-block;cursor:default;}' +
		'.checkbox-label{font-weight:700;width:542px;cursor:pointer;}' +
		'.descript-label{width:500px;margin-top:8px;}' +
		'.text-input-label{width:400px;}' +
		'.split-input-label {width: 300px;}' +
		'.rpht_textarea{border:1px solid #000;width:611px;padding:2px;background:#e6e3df;}' +
		'.rpht_chat_tab{position:absolute;height:54px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;}' +
		'.rpht-checkbox{height:16px;width:16px;}' +
		'input.rpht-short-input{width:200px;}' +
		'input.rpht-long-input{max-width:100%;}' +
		'.msg-padding{line-height: 1.25em}'+
		'.alert-ping{background:#F00; color: #FFF; font-weight: bold;}' +
		'.switch{position:relative;right:12px;width:50px;height:24px;float:right;}' +
		'.switch input{opacity:0;width:0;height:0;}' +
		'.rpht-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;-webkit-transition:.4s;transition:.4s}' +
		'.rpht-slider:before{position:absolute;content:"";height:16px;width:16px;left:4px;bottom:4px;background-color:#fff;-webkit-transition:.4s;transition:.4s}' +
		'input:checked+.rpht-slider{background-color:#2196f3}' +
		'input:focus+.rpht-slider{box-shadow:0 0 1px #2196f3}' +
		'input:checked+.rpht-slider:before{-webkit-transform:translateX(26px);-ms-transform:translateX(26px);transform:translateX(26px)}' +
		'.rpht-slider.round{border-radius:34px}' +
		'.rpht-slider.round:before{border-radius:50%}' +
		'.rpht-cmd-tooltip{position: absolute; bottom: 120px; left: 200px; width: 860px; height: auto; color: #dedbd9; background: #303235; opacity: 0.9; padding: 10px;}' +
		'</style>'

	/**
	 * Initializes the modules and the HTML elements it handles.
	 * @param {Array} addonModules Modules to add into the system.
	 */
	function init (addonModules) {
		var $settingsDialog = $('#settings-dialog')
		modules = addonModules

		if (Notification.permission !== 'denied') {
			Notification.requestPermission()
		}

		$('head').append(rpht_css)
		$('#settings-dialog .inner ul.tabs').append('<h3>RPH Tools</h3>')
		
		/* Checks to see if there's a local store for settings and creates one
		 * if there isn't. */
		var settings = localStorage.getItem(SETTINGS_NAME)
		if (!settings) {
			settings = {}
			localStorage.setItem(SETTINGS_NAME, JSON.stringify(settings))
		}

		modules.forEach(function (module) {
			if (module.getHtml) {
				html = module.getHtml()
				$('#settings-dialog .inner ul.tabs')
					.append('<li><a href="#' + html.tabId + '">' + html.tabName +
						'</a></li>')
				$('#settings-dialog .inner div.content div.inner')
					.append('<div id="' + html.tabId + '" style="display: none;">' +
						html.tabContents + '</div>')

				$settingsDialog.find('.tabs a[href="#' + html.tabId + '"]').click(
					function (ev) {
						$settingsDialog.find('.content .inner > div').hide()
						$settingsDialog.find($(this).attr('href')).show()
						ev.preventDefault()
					})

				module.init()
			}
		})
	}

	/**
	 * Returns a module based on a name passed in.
	 * @param {string} name Name of the module to get the data
	 * @returns Returns the module, if found. Otherwise returns null.
	 */
	var getModule = function (name) {
		var module = null
		for (var i = 0; i < modules.length; i++) {
			if (modules[i].toString() === name) {
				module = modules[i]
				break
			}
		}
		return module
	}

	function getAllModules() {
		return modules
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'RPH Tools Module'
	}

	return {
		init: init,
		getModule: getModule,
		getAllModules: getAllModules,
		getHtml: getHtml,
		toString: toString,
	}
}());/****************************************************************************
 * Script initializations to execute after the page loads
 ***************************************************************************/
$(function () {
	console.log(`RPH Tools ${VERSION_STRING} start`)
	var modules = [
		chatModule,
		pmModule,
		moddingModule,
		settingsModule,
		aboutModule,
	]

	rphToolsModule.init(modules)
	console.log('RPH Tools initialization complete')
});