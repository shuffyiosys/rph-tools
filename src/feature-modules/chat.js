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
			'		<label class="rpht-label checkbox-label" for="chatColorEnable">Use user text colors</label>' +
			'		<label class="switch"><input type="checkbox" id="chatColorEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Use the user\'s color to stylize their text</label>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<label class="rpht-label checkbox-label" for="chatmsgPaddingEnable">Add padding between messages</label>' +
			'		<label class="switch"><input type="checkbox" id="chatmsgPaddingEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Adds some padding at the end of each message for readibility</label>' +
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
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label checkbox-label" for="selfPingEnable">Can ping yourself</label>' +
			'		<label class="switch"><input type="checkbox" id="selfPingEnable"><span class="slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Pings will trigger on your own messages</label>' +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label style="font-weight: bold; width:522px; padding: 0px;">Desktop notification duration</label>' +
			'		<select style="width: 80px;" id="pingNotifyTimeoutSelect">' +
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

		$('#chatmsgPaddingEnable').change(() => {
			chatSettings.msgPadding = getCheckBox('#chatmsgPaddingEnable')
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

		$('#selfPingEnable').change(() => {
			chatSettings.selfPing = getCheckBox('#selfPingEnable')
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
		let modUserIdx = -1

		thisRoom.$tabs[0].click(() => {
			thisRoom.$tabs[0].removeAttr('style')
		})

		for (var idx = 0; idx < account.userids.length && !modUserIdx !== -1; idx++) {
			if (thisRoom.props.mods.indexOf(account.userids[idx]) > -1 ||
				thisRoom.props.owners.indexOf(account.userids[idx]) > -1) {
				modUserIdx = account.userids[idx]
			}
		}

		chatSocket._callbacks.$msg.pop()
		chatSocket.on('msg', (data) => {
			for (const msgData of data) {
				getUserById(msgData.userid, function(User){
					postMessage(getRoom(msgData.room), User, msgData, (modUserIdx !== -1))
				})
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
			chatTextArea.bind('keydown', function (ev) {
				intputChatText(ev, User, thisRoom)
			})
			resizeChatTabs()
		})
	}

	function postMessage(thisRoom, User, data, isMod) {
		let timestamp = makeTimestamp(data.time);
		let msg = parseMsg(data.msg);
		let selfMsg = account.userids.includes(data.userid)

		/* Check to see if there's a RNG marker, then process it if it's there */
		if (msg.indexOf('\u200b') > -1) {
			msg = ` ${parseMsg(parseRng(data))} <span style="background:#4A4; color: #FFF;"> &#9745; </span>`
		}

		/* Add pings if it's enabled AND ((self pinging is enabled AND the message is owned by self) OR it's another's) */
		if (chatSettings.enablePings && ((chatSettings.selfPing && selfMsg === true) || selfMsg === false)) {
			let testRegex = null
			testRegex = matchPing(msg)
			if (testRegex) {
				msg = highlightPing(msg, testRegex)
				highlightRoom(thisRoom)
				pingSound.play()

				/* Bring up the notification if enabled, but don't do it if the user pinged themselves*/
				if (chatSettings.pingNotify && selfMsg === false) {
					let notification = new Notification(`${User.props.name} pinged you in ${thisRoom.props.name}`)
					setTimeout(() => {
						notification.close()
					}, chatSettings.notifyTime)
				}
			}
		}

		if(thisRoom.isActive() === false) {
			thisRoom.$tabs[0].css('border-bottom', '4px solid #ADF')
		}

		/* Process other's messages for issues if a mod */
		if (isMod && moddingModule && selfMsg === false) {
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

		let classes = ''
		let msgHtml = ''
		let colorStyle = (chatSettings.colorText) ? `style="color: #${User.props.color.toString()}"` : ``
		if (data.msg.charAt(0) === '/' && data.msg.slice(1, 3) === 'me') {
			classes += 'action ';
			msgHtml = thisRoom.appendMessage(
				`<span class="first"><span class="timestamp">${timestamp}</span></span>
				 	<span ${colorStyle}><a class="name" title="${timestamp}">${data.userid}</a>${msg}</span>`
			).addClass(classes);
		} else {
			msgHtml = thisRoom.appendMessage(
				`<span class="first"><span class="timestamp">${timestamp}</span><a class="name" title="${timestamp}">${data.userid}</a></span>
				<span ${colorStyle}>${msg}</span>`
			).addClass(classes);
			msgHtml.find('.name').data('userid', data.userid);
		}
		msgHtml.find('br:gt(10)').remove();

		if (chatSettings.msgPadding) {
			classes += 'msg-padding '
		}
		if( User.friendOf ){
			classes += 'friend ';
		}
		if( isOwnUser(User) ){
			classes += 'self ';
		}
		if( isOwnerOf(thisRoom, User) ){
			classes += 'owner ';
		} else if( isModOf(thisRoom, User) ){
			classes += 'mod ';
		}
		if( isInGroup(thisRoom, User) ){
			classes += 'group-member ';
		}
		msgHtml.addClass(classes);
		msgHtml.find('.name').text(User.props.vanity || User.props.name)
			.attr('data-content', (User.props.vanity || User.props.name))
			.attr('title', User.props.name);
		if( msgHtml.find('.name').length > 0 ){
			if( Array.isArray(User.props.color) ){
				User.props.color.forEach( (hex, i) => {
					msgHtml.find('.name').get(0).style.setProperty('--color'+(i+1), '#'+User.props.color[i])
				})
			}
		}
		if( User.props.fade ){
			if( User.props.fade == 1 ){
				msgHtml.find('.name').addClass('vertical-fade');
			} else if( User.props.fade == 2 ){
				msgHtml.find('.name').addClass('horizontal-fade');
			} else if( User.props.fade == 3 ){
				msgHtml.find('.name').addClass('radial-fade')
			}
		}
		if( User.props.color.length > 1 ){
			let numColorClass = '-color';
			if( User.props.color.length == 2 ){
				numColorClass = 'two'+numColorClass;
			} else {
				numColorClass = 'three'+numColorClass;
			}
			msgHtml.find('.name').addClass(numColorClass);
		}
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
					newMessage = rngModule.genCoinFlip()
					Room.sendMessage(newMessage, User.props.id)
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
						newMessage = rngModule.getDiceRoll(die, sides, true)
						Room.sendMessage(newMessage, User.props.id)
					}
				}
				break
			case '/random':
				var rngModule = rphToolsModule.getModule('RNG Module')
				if (rngModule) {
					newMessage = rngModule.genRandomNum()
					Room.sendMessage(newMessage, User.props.id)
				}
				break
			case '/rps':
				const results = ['Rock!', 'Paper!', 'Scissors!']
				newMessage = `/me plays Rock, Paper, Scissors and chooses... ${results[Math.ceil(Math.random() * 3) % 3].toString()}`
				Room.sendMessage(newMessage, User.props.id)
				break
			case '/leave':
				chatSocket.emit('leave', {
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
	 * Checks if the message has any ping terms
	 * @param {string} msg - The message for the chat
	 * @returns Returns the match or null
	 */
	function matchPing(msg, triggers = chatSettings.triggers, caseSensitive = chatSettings.case, exactMatch = chatSettings.exact) {
		if (triggers.length === 0){
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
	 * Adds a highlight to the room's tab
	 * @param {object} thisRoom - Room where the ping happened.
	 */
	function highlightRoom(thisRoom, alert = false) {
		if (!thisRoom.isActive()) {
			if (alert) {
				thisRoom.$tabs[0].css('background-color', '#F00')
				thisRoom.$tabs[0].css('color', '#FFF')
			} else {
				thisRoom.$tabs[0].css('background-color', chatSettings.highlight)
				thisRoom.$tabs[0].css('color', chatSettings.color)
			}
		}
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
		chatSettings = {
			'colorText': true,
			'msgPadding': false,
	
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
		$('#chatmsgPaddingEnable').prop("checked", chatSettings.msgPadding)
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
}());