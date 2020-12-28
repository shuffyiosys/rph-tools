/**
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

	let audioHtml = 
			'<audio id="im-sound">' +
				'<source src="https://www.rphaven.com/sounds/imsound.mp3" type="audio/mpeg">' +
  			'</audio>'

	var awayMessages = {}

	function init() {
		loadSettings()
		$('body').append(audioHtml)

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
				$('#im-sound').children("source").attr('src', pmSettings.audioUrl)
				settingsModule.saveSettings(localStorageName, pmSettings)
			}
		})

		$('#pmMute').change(() => {
			if ($('#pmMute').is(":checked")) {
				pmSettings.pmMute = true
			} else {
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
				if (pmSettings.pmMute === false) {
					$('#im-sound')[0].play()
				}
				
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
}());