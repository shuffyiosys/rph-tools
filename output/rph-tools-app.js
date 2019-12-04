// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    4.2.0
// @description Adds extended settings to RPH
// @match      https://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT
// ==/UserScript==

const VERSION_STRING = '4.2.0'

const SETTINGS_NAME = "rph_tools_settings"
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
 * Un an array of objects, return the first instance where a key matches the
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
 * @param {*} value - Number that seeds the RNG
 */
function LcgRng (value) {
	let result = (((value * 214013) + 2531011) % Math.pow(2,31))
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


var chatHistory = {}
var chatHistIdx = 0

/**
 * Modified handler for keyup events from the chat textbox
 * @param {object} ev - Event
 * @param {object} User - User the textbox is attached to
 * @param {oject} Room - Room the textbox is attached to
 */
function intputChatText(ev, User, Room) {
	var inputTextBox = null
	var roomTextboxName = ""
	Room.$tabs.forEach(function (roomTab) {
		var classesLen = roomTab[0].classList.length
		if (roomTab[0].classList[classesLen - 1] === 'active') {
			inputTextBox = $('textarea.' + User.props.id + '_' + makeSafeForCss(Room.props.name))
			roomTextboxName = 'textarea.' + User.props.id + '_' + makeSafeForCss(Room.props.name)
			if (!chatHistory[roomTextboxName]){
				chatHistory[roomTextboxName] = {}
			}
		}
	})

	if (ev.keyCode === 13 && ev.ctrlKey === false && ev.shiftKey === false && inputTextBox.val() !== '' && inputTextBox.val().trim() !== '') {
		var newMessage = inputTextBox.val()

		if (newMessage.length > 4000) {
			Room.appendMessage(
				'<span class="first">&nbsp;</span>\n\
			<span title="' + makeTimestamp(false, true) + '">Message too long</span>'
			).addClass('sys')
			return
		}

		chatHistory[roomTextboxName][0] = newMessage

		if (newMessage[0] === '/' && newMessage.substring(0, 2) !== '//' && chatModule) {
			chatModule.parseSlashCommand(inputTextBox, Room, User)
		} else {
			sendChatMessage(inputTextBox, Room, User)
		}
	}
	/* Up */
	else if (ev.keyCode === 38 && 
			 inputTextBox.prop("selectionStart") === 0 && 
			 chatHistIdx === 0) 
	{
		chatHistory[roomTextboxName][1] = inputTextBox.val()
		inputTextBox.val(chatHistory[roomTextboxName][0])
		chatHistIdx = 1
	}
	/* Down */
	else if (ev.keyCode === 40 && 
			 (inputTextBox.prop("selectionStart") === inputTextBox.val().length) && 
			 chatHistIdx === 1 ) 
	{
		chatHistory[roomTextboxName][0] = inputTextBox.val()
		inputTextBox.val(chatHistory[roomTextboxName][1])
		chatHistIdx = 0
	}
}

function sendChatMessage(inputTextBox, Room, User) {
	var newMessage = inputTextBox.val()
	var thisTab = rph.tabs[User.props.id]
	var newLength = newMessage.length
	Room.sendMessage(newMessage, User.props.id)
	inputTextBox.val('')

	if (newMessage.match(/\n/gi)) {
		newLength = newLength + (newMessage.match(/\n/gi).length * 250)
	}
	
	var curTime = Math.round(new Date().getTime() / 1000)
	thisTab.bufferLength = (thisTab.bufferLength / (curTime - thisTab.lastTime + 1)) + ((newLength + thisTab.bufferLength) / 3) + 250
	thisTab.lastTime = curTime
	if (thisTab.bufferLength > 1750) {
		thisTab.offenses += 1
		if (thisTab.offenses > 2) {
			Room.sendMessage('Flood kick', User.props.id)
			chatSocket.disconnect()
			return
		} else {
			Room.appendMessage(
				'<span class="first">&nbsp;</span>\n\
			<span title="' + makeTimestamp(false, true) + '">You are flooding. Be careful or you\'ll be kicked</span>'
			).addClass('sys')
			setTimeout(function () {
				thisTab.offenses = 0
			}, 15000)
			return
		}
	}
}/****
 * This module handles the chat functions of the script.
 ****/
var chatModule = (function () {
	var chatSettings = {
		'colorText': false,
		'msgMargin': false,
		'combineMsg': true,

		'enablePings': true,
		'pingNotify': false,
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
		'roomSession': [],
		'favRooms': [],
	}

	var localStorageName = "chatSettings"

	var pingSound = null

	var autoDismissTimer = null

	var autoJoinTimer = null

	var lastChatMsg = null

	let pingUsed = false

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
			'		<label class="rpht-label checkbox-label" for="chatColorEnable">Use user text colors</label>' +
			'		<label class="switch"><input type="checkbox" id="chatColorEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Use the user\'s color to stylize their text</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="chatMsgMarginEnable">Add padding between messages</label>' +
			'		<label class="switch"><input type="checkbox" id="chatMsgMarginEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Adds some padding at the end of each message for readibility</label>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<label class="rpht-label checkbox-label" for="combineMsgEnable">Consecutive layout</label>' +
			'		<label class="switch"><input type="checkbox" id="combineMsgEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Cleans up the left sidebar by not including user names if they post consecutively and not including timestamps if in the same minute</label>' +
			'	</div>' +
			'</div>' +
			'<h4>Chat Pinging</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="notifyPingEnable">Enable pings</label>' +
			'		<label class="switch"><input type="checkbox" id="notifyPingEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">	Turns on ping notifications in chat</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="notifyNotificationEnable">Enable desktop notifications</label>' +
			'		<label class="switch"><input type="checkbox" id="notifyNotificationEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Pops up a notification when you get pinged</label>' +
			'	</div>' +
			'<div class="rpht-option-section">' +
			'<label style="font-weight: bold; width:522px; padding: 0px;">Desktop notification duration</label>' +
			'<select style="width: 80px;" id="pingNotifyTimeoutSelect">' +
			'	<option value="3000">Short</option>' +
			'	<option value="6000" selected>Normal</option>' +
			'	<option value="10000">Long</option>' +
			'</select>' +
			'<label class="rpht-label descript-label">How long the notification will stay up</label>' +
			'</div>' +
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
			'		<label class="switch"><input type="checkbox" id="pingExactMatch"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">e.g., If pinging on "Mel", matches on "Mel" and not "Melody"</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="pingCaseSense">Case sensitive</label>' +
			'		<label class="switch"><input type="checkbox" id="pingCaseSense"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">e.g., If pinging on "Mel", matches on "Mel" and not "mel"</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<h4>Ping styling</h4>' +
			'		<label class="rpht-label text-input-label">Text Color</label><input type="text" class="rpht-short-input" id="pingTextColor" value="#000"><br /><br />' +
			'		<label class="rpht-label text-input-label">Highlight</label><input type="text" class="rpht-short-input" id="pingHighlightColor" value="#FFA"><br><br>' +
			'		<label class="rpht-label checkbox-label" style="font-weight:initial;" for="pingBoldEnable">Add <strong>bold</strong></label>' +
			'		<label class="switch"><input type="checkbox" id="pingBoldEnable"><span class="slider round"></span></label><br><br>' +
			'		<label class="rpht-label checkbox-label" style="font-weight:initial;" for="pingItalicsEnable">Add <em>Italics</em></label>' +
			'		<label class="switch"><input type="checkbox" id="pingItalicsEnable"><span class="slider round"></span></label>' +
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
			'		<label class="switch"><input type="checkbox" id="joinFavEnable"><span class="slider round"></span></label>' +
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

	function init() {
		loadSettings()

		/* General Options */
		$('#chatColorEnable').change(() => {
			chatSettings.colorText = getCheckBox('#chatColorEnable')
			saveSettings()
		})

		$('#chatMsgMarginEnable').change(() => {
			chatSettings.msgMargin = getCheckBox('#chatMsgMarginEnable')
			saveSettings()
		})
		$('#combineMsgEnable').change(() => {
			chatSettings.combineMsg = getCheckBox('#combineMsgEnable')
			saveSettings()
		})

		/* Pinging Options */
		$('#notifyPingEnable').change(() => {
			chatSettings.enablePings = getCheckBox('#notifyPingEnable')
			saveSettings()
		})

		$('#notifyNotificationEnable').change(() => {
			chatSettings.pingNotify = getCheckBox('#notifyNotificationEnable')
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
			chatSettings.audioUrl = getInput('#pingURL')
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
			if (validateSetting('#pingHighlightColor', 'color-allrange') === true) {
				chatSettings.highlight = getInput('#pingHighlightColor')
				saveSettings()
			}
		})

		$('#pingBoldEnable').change(() => {
			chatSettings.bold = getCheckBox('#pingBoldEnable')
			saveSettings()
		})

		$('#pingItalicsEnable').change(() => {
			chatSettings.italics = getCheckBox('#pingItalicsEnable')
			saveSettings()
		})

		$('#pingExactMatch').change(() => {
			chatSettings.exact = getCheckBox('#pingExactMatch')
			saveSettings()
		})

		$('#pingCaseSense').change(() => {
			chatSettings.case = getCheckBox('#pingCaseSense')
			saveSettings()
		})

		$('#pingPreviewInput').blur(() => {
			var msg = getInput('#pingPreviewInput')
			var testRegex = matchPing(msg)
			if (testRegex !== null) {
				msg = highlightPing(msg, testRegex, chatSettings.color,
					chatSettings.highlight, chatSettings.bold,
					chatSettings.italics)
				pingSound.play()
				$('#pingPreviewText')[0].innerHTML = msg
			} else {
				$('#pingPreviewText')[0].innerHTML = "No match"
			}
		})

		/* Session Options */
		$('#joinFavEnable').click(() => {
			chatSettings.joinFavorites = getCheckBox('#joinFavEnable')
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

		chatSocket.on('confirm-room-join', function (data) {
			roomSetup(data)
		})

		/* Setup the timer for automatically dismissing the opening dialog once
		   rooms are available. The timer clears after. */
		autoDismissTimer = setInterval(() => {
			if (roomnames.length === 0) {
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
		var sessionModule = rphToolsModule.getModule('Session Module')
		let modUserIdx = -1

		for (var idx = 0; idx < account.userids.length && !modUserIdx !== -1; idx++) {
			if (thisRoom.props.mods.indexOf(account.userids[idx]) > -1 ||
				thisRoom.props.owners.indexOf(account.userids[idx]) > -1) {
				modUserIdx = account.userids[idx]
			}
		}

		if (chatSocket._callbacks.$msg.length === 1) {
			chatSocket.on('msg', (data) => {
				let msgData = data[data.length -1]
				let chatMsgHtml = thisRoom.$el[0].lastChild
				if (!chatMsgHtml || $(chatMsgHtml).hasClass('sys') || $(chatMsgHtml).hasClass('join')) {
					return
				}
				getUserById(msgData.userid, (User) => {
					modifyMessage(getRoom(msgData.room), msgData, User, (modUserIdx !== -1))
				})
			})
		}
		
		getUserById(userId, (User) => {
			addNameToUI(thisRoom, User)
			if (moddingModule !== null && modUserIdx === userId) {
				moddingModule.addModRoomPair(User.props, thisRoom.props.name)
			}

			if (sessionModule !== null) {
				sessionModule.addRoomToSession(room.room, userId)
			}

			resizeChatTabs()
			$('div.' + User.props.id + '_' + makeSafeForCss(thisRoom.props.name) + ' .user-for-textarea span').css('overflow', 'hidden')
			var chatTextArea = $('textarea.' + User.props.id + '_' + makeSafeForCss(thisRoom.props.name))
			chatTextArea.unbind('keyup')
			chatTextArea.bind('keydown', function (ev) {
				intputChatText(ev, User, thisRoom)
			})
		})
	}
	/**
	 * Takes a message received in the chat and processes it for pinging or 
	 * otherwise
	 * @param {object} thisRoom The room that the message is for.
	 * @param {object} data The message for the room
	 */
	function modifyMessage(thisRoom, data, User, isMod) {
		let chatMsgHtml = thisRoom.$el[0].lastChild
		let sideBarHtml = chatMsgHtml.children[0]
		let msgHtml = chatMsgHtml.children[1]
		let nameHtml = ''
		let msg = ''
		var moddingModule = rphToolsModule.getModule('Modding Module')

		if (msgHtml.children[0] && msgHtml.children[0].tagName === 'A') {
			meAction = true
			nameHtml = msgHtml.children[0].outerHTML
			$(msgHtml.children[0]).remove()
		}
		msg = msgHtml.innerHTML

		if (chatSettings.msgMargin) {
			$(chatMsgHtml).addClass('msg-padding')
		}
		if (!chatSettings.combineMsg) {
			sideBarHtml.children[0].innerHTML = makeTimestamp(data.time, true)
			$(chatMsgHtml).find('.name').removeData('userid');
			pingUsed = false
		}

		/* Check to see if there's a RNG marker, then process it if it's there */
		if (msg.indexOf('\u200b') > -1) {
			$(chatMsgHtml.children[1].lastChild)[0].data = ' '
			$(chatMsgHtml.children[1]).append(`<span>${parseMsg(parseRng(data))} <span style="background:#4A4; color: #FFF;"> &#9745; </span></span>`)
		}

		/* Add pings */
		if (chatSettings.enablePings && !pingUsed) {
			var testRegex = null
			testRegex = matchPing(msg)
			if (testRegex) {
				msg = highlightPing(msg, testRegex)
				highlightRoom(thisRoom)
				pingSound.play()
				pingUsed = true
	
				/* Bring up the notification if enabled, but don't do it if the user
				   pinged themselves*/
				if (chatSettings.pingNotify && account.userids.includes(User.props.id) === false) {
					let notification = new Notification(`${User.props.name} pinged you in ${thisRoom.props.name}`)
					setTimeout(() => {notification.close()}, chatSettings.notifyTime)
				}
			}
		}
		else if (lastChatMsg != chatMsgHtml) {
			pingUsed = false
		}

		/* Process other's messages for issues if a mod */
		if (isMod && moddingModule && account.userids.includes(User.props.id) === false) {
			let alertRegex = null
			let alertWords = moddingModule.getAlertWords()
			alertRegex = matchPing(msg, alertWords, false, true)
			// Process alert
			if (alertRegex) {
				msg = highlightPing(msg, alertRegex, true)
				highlightRoom(thisRoom, true)
				moddingModule.playAlert()
			}
		}
		msgHtml.outerHTML = `<span>${nameHtml}${msg}</span>`
		/* Finally, add text color */
		if (chatSettings.colorText) {
			$(chatMsgHtml.children[1]).css('color', `#${User.props.color.toString()}`)
		}
		lastChatMsg = chatMsgHtml
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
			case '/coinflip':
				var rngModule = rphToolsModule.getModule('RNG Module')
				if (rngModule) {
					inputTextBox.val(rngModule.genCoinFlip())
					sendChatMessage(inputTextBox, Room, User)
				}
				break
			case '/roll':
				var rngModule = rphToolsModule.getModule('RNG Module')
				if (rngModule) {
					var die = 1
					var sides = 20
					if (cmdArgs.length > 1) {
						die = parseInt(cmdArgs[1].split('d')[0])
						sides = parseInt(cmdArgs[1].split('d')[1])
					}
					if (isNaN(die) || isNaN(sides)) {
						error = true
					} else {
						inputTextBox.val(rngModule.getDiceRoll(die, sides, true))
						sendChatMessage(inputTextBox, Room, User)
					}
				}
				break
			case '/random':
				var rngModule = rphToolsModule.getModule('RNG Module')
				if (rngModule) {
					inputTextBox.val(rngModule.genRandomNum())
					sendChatMessage(inputTextBox, Room, User)
				}
				break
			case '/rps':
				const results = ['Rock!', 'Paper!', 'Scissors!']
				inputTextBox.val('/me plays Rock, Paper, Scissors and chooses... ' + results[Math.ceil(Math.random() * 3) % 3].toString())
				sendChatMessage(inputTextBox, Room, User)
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
				sendChatMessage(inputTextBox, Room, User)
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
	 * Checks if the message has any ping terms
	 * @param {string} msg - The message for the chat
	 * @returns Returns the match or null
	 */
	function matchPing(msg, triggers=chatSettings.triggers, caseSensitive=chatSettings.case, exactMatch=chatSettings.exact) {
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
			if (!urlRegex.test(msg)&& testRegex.test(msg)) {
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
	function highlightPing(msg, testRegex, alert=false) {
		if (alert) {
			msg = msg.replace(testRegex,  `<span class="alert-ping">${msg.match(testRegex)}</span>`)
		}
		else {
			let styleText = `color: ${chatSettings.color}; background: ${chatSettings.highlight};`

			if (chatSettings.bold === true) {
				styleText += ' font-weight: bold;'
			}
			if (chatSettings.italics === true) {
				styleText += ' font-style:italic;'
			}
			msg = msg.replace(testRegex,  `<span style="${styleText}">${msg.match(testRegex)}</span>`)
		}
		return msg
	}

	/**
	 * Adds a highlight to the room's tab
	 * @param {object} thisRoom - Room where the ping happened.
	 */
	function highlightRoom(thisRoom, alert=false) {
		if (!thisRoom.isActive()) {

			if (alert) {
				thisRoom.$tabs[0].css('background-color', '#F00')
				thisRoom.$tabs[0].css('color', '#FFF')
			}
			else {
				thisRoom.$tabs[0].css('background-color', chatSettings.highlight)
				thisRoom.$tabs[0].css('color', chatSettings.color)
			}

			thisRoom.$tabs[0].click(() => {
				thisRoom.$tabs[0].css('background-color', '#333')
				thisRoom.$tabs[0].css('color', '#6F9FB9')

				thisRoom.$tabs[0].hover(() => {
					thisRoom.$tabs[0].css('background-color', '#6F9FB9')
					thisRoom.$tabs[0].css('color', '#333')
				}, () => {
					thisRoom.$tabs[0].css('background-color', '#333')
					thisRoom.$tabs[0].css('color', '#6F9FB9')
				})
			})
		}
	}

	/**
	 * Adds user name to chat tab and chat textarea
	 * @param {object} thisRoom - Room that was entered
	 * @param {number} userId - ID of the user that entered
	 **/
	function addNameToUI(thisRoom, User) {
		var tabsLen = thisRoom.$tabs.length
		var idRoomName = thisRoom.$tabs[tabsLen - 1][0].className.split(' ')[2]
		var newTabHtml = '<span>' + thisRoom.props.name +
			'</span><p style="font-size: x-small; margin-top: -58px;">' +
			User.props.name + '</p>'
		thisRoom.$tabs[tabsLen - 1].html(newTabHtml)
		$('<a class="close ui-corner-all">x</a>').on('click', (ev) => {
			ev.stopPropagation()
			chatSocket.emit('leave', {
				userid: User.props.id,
				name: thisRoom.props.name
			})
		}).appendTo(thisRoom.$tabs[tabsLen - 1])
		$('textarea.' + idRoomName).prop('placeholder', 'Post as ' + User.props.name)
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
		if (roomnames.length === 0) {
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
			chatSocket.emit('join', {
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
		let sessionSettings = settingsModule.getSettings('sessionSettings')
		if (storedSettings) {
			chatSettings = Object.assign(chatSettings, storedSettings)
		} else {
			chatSettings = {
				'colorText': false,
				'msgMargin': false,
				'combineMsg': false,

				'enablePings': true,
				'pingNotify': false,
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
				'roomSession': [],
				'favRooms': [],
			}
		}

		if (sessionSettings) {
			chatSettings.joinFavorites = sessionSettings.joinFavorites
			chatSettings.roomSession = sessionSettings.roomSession
			chatSettings.favRooms = sessionSettings.favRooms
		}

		$('#chatColorEnable').prop("checked", chatSettings.colorText)
		$('#chatMsgMarginEnable').prop("checked", chatSettings.msgMargin)
		$('#combineMsgEnable').prop("checked", chatSettings.combineMsg) 

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
	var pmSettings = {
		'colorText': false,
		'notify': false,
		'notifyTime': 6000,
		'audioUrl': 'https://www.rphaven.com/sounds/imsound.mp3',
		'pmMute': false,
	}

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
			'		<label class="switch"><input type="checkbox" id="pmColorEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Use the user\'s color to stylize their text</label>' +
			'	</div>' +
			'</div>' +
			'<h4>PM Notification Settings</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="pmNotify">Enable desktop notifications</label>' +
			'		<label class="switch"><input type="checkbox" id="pmNotify"><span class="slider round"></span></label>' +
			'		<p>Pops a desktop notification when you get a PM</p>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label style="font-weight: bold; width:522px; padding: 0px;">Desktop notification duration</label>' +
			'		<select style="width: 80px;" id="pmNotifyTimeoutSelect">' +
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
			'		<label class="switch"><input type="checkbox" id="pmMute"><span class="slider round"></span></label>' +
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
			pmSettings.colorText = getCheckBox('#pmColorEnable')
			settingsModule.saveSettings(localStorageName, pmSettings)
		})

		$('#pmNotify').change(() => {
			pmSettings.notify = getCheckBox('#pmNotify')
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
			removePmAway()
		})

		$('#pmPingURL').change(() => {
			if (validateSetting('pmPingURL', 'url')) {
				pmSettings.audioUrl = getInput('pmPingURL')
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
			/* Check if the user is blocked */
			if (account.ignores.indexOf(data.to) > -1) {
				return;
			}
			rph.getPm({'from':data.from, 'to':data.to}, function(pm){
				handleIncomingPm(data, pm)
				pm.typingStop()
			})
		})

		socket.onOutgoing('pm', (data) => {
			if (account.ignores.indexOf(data.to) > -1) {
				return;
			}
			rph.getPm({'from':data.from, 'to':data.to}, function(pm){
				handleOutgoingPm(data, pm)
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

	/**
	 * Handler for PMs that are incoming
	 * @param {object } data Data containing the PM.
	 */
	function handleIncomingPm(data, pm) {
		let lastMsg = pm.$msgs[0].lastChild
		let styleString = 'style="'

		if (lastMsg.lastChild.data.charAt(1) === '/') {
			lastMsg.lastChild.data = ` ${parseCommand(data)}`
		}

		if(pmSettings.colorText) {
			styleString += `color: #${pm.to.props.color.toString()};`
		}
		styleString += `opacity: 1.0;"`
		lastMsg.innerHTML = `${lastMsg.children[0].outerHTML}<span ${styleString}>${lastMsg.children[1].outerHTML}${lastMsg.lastChild.data }</span>`
	}

	/**
	 * Handler for PMs that are outgoing
	 * @param {object } data Data containing the PM.
	 */
	function handleOutgoingPm(data, pm) {
		let pmMsgHtml = null
		let styleString = 'style="'
		for(let i = pm.$msgs[0].children.length -1; i > -1; i--) {
			let msgHtml = pm.$msgs[0].children[i].innerHTML
			if (msgHtml.match(pm.from.props.name, 'i')){
				pmMsgHtml = pm.$msgs[0].children[i]
				break
			}
		}
		if (!pmMsgHtml) {return}
		let msg = pmMsgHtml.lastChild.data
		if (msg.charAt(1) === '/') {
			msg = ` ${parseCommand(data)}`
		}
		if(pmSettings.colorText) {
			styleString += `color: #${pm.from.props.color.toString()};`
		}
		styleString += `opacity: 1.0;"`
		$(pmMsgHtml.lastChild).remove()
		$(pmMsgHtml).append(`<span ${styleString}>${msg}</span>`)

		if (awayMessages[data.from] && !awayMessages[data.from].usedPmAwayMsg) {
			awayMessages[data.from].enabled = false
			$('#pmNamesDroplist option').filter(function () {
				return this.value == data.from
			}).css("background-color", "")
			awayMessages[data.from].usedPmAwayMsg = false
		}
	}

	function parseCommand(data) {
		var msg = parseMsg(data.msg);
		var cmdArgs = msg.split(/ (.+)/)
		switch(cmdArgs[0]) {
			case '/roll':
				let die = 1
				let sides = 20
				let rolls = []
				let total = 0
				
				if (cmdArgs.length > 1) {
					die = parseInt(cmdArgs[1].split('d')[0])
					sides = parseInt(cmdArgs[1].split('d')[1])
				}
				if (isNaN(die) || isNaN(sides)) {
					error = true
				} 
				else {
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
		}
		return msg
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
	function removePmAway() {
		var userId = $('#pmNamesDroplist option:selected').val()

		if (!awayMessages[userId]) {
			return
		}

		if (awayMessages[userId].enabled) {
			var name = $("#pmNamesDroplist option:selected").html()
			awayMessages[userId].enabled = false
			$("#pmNamesDroplist option:selected").html(name.substring(6, name.length))
			$("#pmNamesDroplist option:selected").css("background-color", "")
			$('input#awayMessageTextbox').val("")
			console.log('RPH Tools[removePmAway]: Remove away message for', name)
		}
	}

	function loadSettings() {
		var storedSettings = settingsModule.getSettings(localStorageName)
		if (storedSettings) {
			pmSettings = Object.assign(pmSettings, storedSettings)
		} 
		else {
			pmSettings = {
				'colorText': false,
				'notify': false,
				'notifyTime': 6000,
				'audioUrl': 'https://www.rphaven.com/sounds/imsound.mp3',
				'pmMute': false,
			}
		}

		$('#pmColorEnable').prop("checked", pmSettings.colorText)
		$('#pmEnhnaceContrastEnable').prop("checked", pmSettings.enhanceContrast)
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
			'		<label class="switch"><input type="checkbox" id="wordAlertEnable"><span class="slider round"></span></label>' +
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
				chatSocket.emit('modify', {
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
				settings.alertUrl = getInput('#modAlertUrl')
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
	 * Performs a modding action
	 * @param {string} action Name of the action being performed
	 */
	function modAction(action) {
		var targets = $('#modTargetTextInput').val().replace(/\r?\n|\r/, '')
		targets = targets.split(',')
		console.log('RPH Tools[modAction]: Performing', action, 'on', targets)

		targets.forEach(function (target) {
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
				chatSocket.emit(action, {
					room: roomName,
					userid: user.props.id,
					targetid: target.props.id,
					msg: modMessage
				})
			})
		})
	}

	function findUserAsMod(userObj) {
		roomnames.forEach((roomname) => {
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

	function processFilterAction(action, modName, targetName, roomName) {
		moddingModule.emitModAction(action, targetName, modName, roomName, settings.autoKickMsg)
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
		'#settings-dialog .inner > div > div.rpht-option-block{width:640px;border:#888 solid 1px;border-radius:10px;padding:12px;padding-top:16px;padding-bottom:16px;margin-bottom:16px}' +
		'.rpht-option-section{border-bottom:#444 solid 1px;padding-bottom:12px;margin-bottom:12px}' +
		'.option-section-bottom{border-bottom:none;margin-bottom:0}' +
		'.rpht-label{padding-left: 0px;text-align:justify;display:inline-block;cursor:default}' +
		'.checkbox-label{font-weight:700;width:542px;cursor:pointer}' +
		'.descript-label{width:500px;margin-top:8px}' +
		'.text-input-label{width:400px}' +
		'.split-input-label {width: 300px;}' +
		'.rpht_textarea{border:1px solid #000;width:611px;padding:2px;background:#e6e3df}' +
		'.rpht_chat_tab{position:absolute;height:54px;overflow-x:auto;overflow-y:hidden;white-space:nowrap}' +
		'.rpht-checkbox{height:16px;width:16px}' +
		'input.rpht-short-input{width:200px}' +
		'input.rpht-long-input{max-width:100%}' +
		'.msg-padding{padding-top: 4px; padding-bottom: 4px}'+
		'.alert-ping{background:#F00; color: #FFF; font-weight: bold;}'
		'.switch{position:relative;right:12px;width:50px;height:24px;float:right}' +
		'.switch input{opacity:0;width:0;height:0}' +
		'.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;-webkit-transition:.4s;transition:.4s}' +
		'.slider:before{position:absolute;content:"";height:16px;width:16px;left:4px;bottom:4px;background-color:#fff;-webkit-transition:.4s;transition:.4s}' +
		'input:checked+.slider{background-color:#2196f3}' +
		'input:focus+.slider{box-shadow:0 0 1px #2196f3}' +
		'input:checked+.slider:before{-webkit-transform:translateX(26px);-ms-transform:translateX(26px);transform:translateX(26px)}' +
		'.slider.round{border-radius:34px}' +
		'.slider.round:before{border-radius:50%}' +
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
	console.log('RPH Tools', VERSION_STRING, 'start')
	var modules = [
		chatModule,
		pmModule,
		rngModule,
		moddingModule,
		settingsModule,
		aboutModule,
	]

	rphToolsModule.init(modules)
	console.log('RPH Tools initialization complete')
});