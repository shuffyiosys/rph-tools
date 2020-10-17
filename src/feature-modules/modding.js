/**
 * This module handles chat modding features. These include an easier way to
 * issue kicks, bans, promotions and demotions. It also can set up monitoring
 * of certain words and alert the mod.
 */
var moddingModule = (function () {
	var settings = {}

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

		$('#wordAlertEnable').click(function () {
			settings.alertOnWords = $('#wordAlertEnable').is(':checked')
			settingsModule.saveSettings(localStorageName, settings)
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
		settings = {
			'alertOnWords': false,
			'alertWords': '',
			'alertUrl': 'https://www.rphaven.com/sounds/boop.mp3',
		}
		var storedSettings = settingsModule.getSettings(localStorageName)

		if (storedSettings) {
			settings = Object.assign(settings, storedSettings)
		}

		$('#modAlertUrl').val(settings.alertUrl)
		$('#wordAlertEnable').prop("checked", settings.alertOnWords)
		$('#modAlertWords').val(settings.alertWords)
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
}());