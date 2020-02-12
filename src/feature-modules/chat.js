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

	const CHAT_COMMANDS = new function() {
		this.away = `<tr><td><code>/away [message]</code></td><td style="padding-bottom:10px;">Sets your status to "Away" and the status message<br>Example: <code>/away I'm away</code></td></tr>`
		this.coinflip = `<tr><td><code>/coinflip</code></td><td style="padding-bottom:10px;">Performs a coin flip</td></tr>`
		this.leave = `<tr><td><code>/leave</code></td><td style="padding-bottom:10px;">Leaves the current room</td></tr>`
		this.me = `<tr><td><code>/me</code></td><td style="padding-bottom:10px;">Formats text as an action</td></tr>`
		this.roll = `<tr><td><code>/roll</code></td><td style="padding-bottom:10px;">Performs a dice roll using a 20-sided die.</td></tr>`
		this.rps = `<tr><td><code>/rps</code></td><td style="padding-bottom:10px;">Performs a Rock/Paper/Scissors action</td></tr>`
		this.status = `<tr><td><code>/status [message]</code></td><td style="padding-bottom:10px;">Sets your status message<br>Example: <code>/status I'm tabbed out</code></td></tr>`
		this.kick = `<tr><td><code>/kick [username],[reason]</code></td><td style="padding-bottom:10px;">Kicks [username] from the current room with [reason] (optional)</td></tr>`
		this.ban = `<tr><td><code>/ban [username],[reason]<br>/unban [username],[reason]</code></td><td style="padding-bottom:10px;">Bans [username] from the current room with [reason] (optional)</td></tr>`
		this['add-mod'] = `<tr><td><code>/add-mod [username]<br>/unmod [username]</code></td><td style="padding-bottom:10px;">Adds [username] as a mod of the current room</td></tr>`
		this['add-owner'] = `<tr><td><code>/add-onwer [username]<br>/unowner [username]</code></td><td style="padding-bottom:10px;">Adds [username] as the owner of the current room</td></tr>`
		this.unban = `<tr><td><code>/unban [username],[reason]</code></td><td style="padding-bottom:10px;">Unbans [username] from the current room with [reason] (optional)</td></tr>`
		this['remove-mod'] = `<tr><td><code>/remove-mod [username]</code></td><td style="padding-bottom:10px;">Removes [username] as a mod of the current room</td></tr>`
		this['remove-owner'] = `<tr><td><code>/remove-owner [username]</code></td><td style="padding-bottom:10px;">Removes [username] as the owner of the current room</td></tr>`
	}

	const CHAT_COMMAND_HTML = `<div id="chatCommandTooltip" style="position: absolute; bottom: 120px; left: 200px; width: 860px; height: auto; color: #dedbd9; background: #303235; padding: 10px;"></div>`

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

			if(!chatSettings.chatCommandPopup){
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
			let roomCss = makeSafeForCss(thisRoom.props.name)
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
				if (chatSettings.chatCommandPopup){
					let chatInput = chatTextArea.val().trim()
					$('#chatCommandTooltip').hide()
					if (chatInput[0] === '/') {
						let commandTable = buildComamndTable(chatTextArea.val().trim())
						if(chatInput.length === 1 || commandTable.length > 0) {
							$('#chatCommandTooltip')[0].innerHTML = commandTable
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
			for (let roomTab of thisRoom.$tabs) {
				roomTab.css('border-bottom', '4px solid #ADF')
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
			let newMsg = newMsgLines.join('<br>')
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
						for (let roomTab of thisRoom.$tabs) {
							roomTab[0].css('background-color', chatSettings.highlight)
							roomTab[0].css('color', chatSettings.color)
						}
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
			contentQuery[0].innerHTML = `${prevMsgs.join('<br>')} ${newMsg} <br>`

			/* Force the time stamp to show */
			$(msgHtml.children[0].children[0]).show()

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
		}
		else {
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
		let inputTextarea = $(`textarea.${User.props.id}_${makeSafeForCss(Room.props.name)}.active`)
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
}());