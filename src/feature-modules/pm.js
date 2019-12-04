/**
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

		socket.on('pm-confirmation', (data) => {
			rph.getPm({'from':data.to, 'to':data.from}, function(pm){
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
		let styleString = ''
		for(let i = pm.$msgs[0].children.length -1; i > -1; i--) {
			let msgHtml = pm.$msgs[0].children[i].innerHTML
			if (msgHtml.match(pm.from.props.name, 'i')){
				pmMsgHtml = pm.$msgs[0].children[i]
				break
			}
		}
		
		if (!pmMsgHtml) {return}
		let timestampHtml = pmMsgHtml.children[0].outerHTML
		let usernameHtml =  pmMsgHtml.children[1].outerHTML
		$(pmMsgHtml.children[0]).remove()
		$(pmMsgHtml.children[0]).remove()
		let msg = pmMsgHtml.innerHTML
		if (msg.charAt(1) === '/') {
			msg = ` ${parseCommand(data)}`
		}
		if(pmSettings.colorText) {
			styleString += `color: #${pm.from.props.color.toString()};`
		}
		styleString += `opacity: 1.0;`
		if (styleString) {
			styleString = `style"${styleString}"`
		}
		pmMsgHtml.innerHTML = `${timestampHtml} ${usernameHtml} <span ${styleString}>${msg}</span>`
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
}());