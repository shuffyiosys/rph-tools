/**
 * This module handles features for the PM system.
 */
var pmModule = (function () {
	var pmSettings = {
		'audioUrl': 'https://www.rphaven.com/sounds/imsound.mp3',
		'pmMute': false,
	}

	var localStorageName = "rpht_PmModule"

	var html = {
		'tabId': 'pm-module',
		'tabName': 'PMs',
		'tabContents': '<h3>PM Settings</h3>' +
			'<div><h4>PM Away System</h4>' +
			'</p>' +
			'<p>Username</p>' +
			'<select style="width: 613px;" id="pmNamesDroplist" size="10"></select>' +
			'<br><br>' +
			'<label class="rpht_labels">Away Message: </label><input type="text" id="awayMessageTextbox" name="awayMessageTextbox" maxlength="300" placeholder="Away message...">' +
			'<br /><br />' +
			'<button style="margin-left: 483px; width:60px" "type="button" id="setAwayButton">Enable</button> <button type="button" style="margin-left: 6px; width:60px" id="removeAwayButton">Disable</button>' +
			'</div><div>' +
			'<h4>Other Settings</h4>' +
			'</p>' +
			'<label class="rpht_labels">PM Sound: </label><input type="text" id="pmPingURL" name="pmPingURL">' +
			'<br /><br />' +
			'<label class="rpht_labels">Mute PMs: </label><input style="width: 40px;" type="checkbox" id="pmMute" name="pmMute">'
	}

	var awayMessages = {}

	function init() {
		loadSettings()
		
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

		socket.on('pm', function (data) {
			handleIncomingPm(data)
		})

		socket.on('outgoing-pm', function (data) {
			handleOutgoingPm(data)
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
	function handleIncomingPm(data) {
		if (!awayMessages[data.from]) {
			return
		}

		if (awayMessages[data.from].enabled) {
			awayMessages[data.from].usedPmAwayMsg = true
			socket.emit('pm', {
				'from': data.from,
				'to': data.to,
				'msg': awayMessages[data.from].message,
				'target': 'all'
			})
		}
	}

	/**
	 * Handler for PMs that are outgoing
	 * @param {object } data Data containing the PM.
	 */
	function handleOutgoingPm(data) {
		if (!awayMessages[data.from]) {
			return
		}

		if (!awayMessages[data.from].usedPmAwayMsg) {
			awayMessages[data.from].enabled = false
			$('#pmNamesDroplist option').filter(function () {
				return this.value == data.from
			}).css("background-color", "")
		}
		awayMessages[data.from].usedPmAwayMsg = false
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
			pmSettings = storedSettings
		} 
		else {
			pmSettings = {
				'audioUrl': 'https://www.rphaven.com/sounds/imsound.mp3',
				'pmMute': false,
			}
		}
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
}());