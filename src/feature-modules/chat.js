/****
 * This module handles the chat functions of the script.
 ****/
let chatModule = (function () {
	let chatSettings = {}

	let localStorageName = "chatSettings"

	let joinedSession = false

	let isRoomMod = {}

	let autoDismissTimer = null

	let autoJoinTimer = null

	let pingHighlightText = ''

	const AUTOJOIN_TIMEOUT_SEC = 5 * 1000

	const MAX_ROOMS = 30

	const AUTOJOIN_INTERVAL = 2 * 1000

	const RNG_TIMEOUT = 30 * 1000

	const ALERT_HIGHLIGHT = `background: #F00; color: #FFF; font-weight: bold;`

	let html = {
		'tabId': 'chat-module',
		'tabName': 'Chat',
		'tabContents': '<h3>Chat Options</h3><br/>' +
			'<h4>Appearance</h4>' +
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
			'		<label class="rpht-label checkbox-label" for="trackSession">Sessioning</label>' +
			'		<label class="switch"><input type="checkbox" id="trackSession"><span class="rpht-slider round"></span></label>' +
			'		<label class="rpht-label descript-label">Keeps track of which rooms you were in, then rejoins them when you log in again.</label>' +
			'	</div>' +
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

	const CHAT_COMMAND_HTML = `<div id="chatCommandTooltip" class="rpht-tooltip-common rpht-cmd-tooltip"></div>`

	const DICE_ROLL_POPUP_HTML = `<div id="diceRollerPopup" class="rpht-tooltip-common">
			<p style="margin-bottom:10px;">Dice Roller <span id="diceRollerClose" class="rpht-close-btn">&nbsp;X&nbsp;</span></p>
			<label class="rpht-die-label"># of die</label> <input id="rpht_dieRollerCount" class="rpht-die-updown" type="number" max="100" min="1" value="1">
			<br>
			<label class="rpht-die-label"># of sides</label> <input id="rpht_dieRollerSides" class="rpht-die-updown" type="number"max="1000" min="2" value="20">
			<br><br>
			<button id="dieRollButton">
				Let's roll!
			</button>
			<hr style="margin-top: 6px; margin-bottom: 6px; ">
			<button id="coinFlipButton">
				Flip a coin!
			</button>
		</div>`

	function init() {
		loadSettings()

		$('#chat-bottom').append(CHAT_COMMAND_HTML)
		$('#chat-bottom').append(DICE_ROLL_POPUP_HTML)
		$('#chatCommandTooltip').hide()
		$('#diceRollerPopup').hide()

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
			let triggers = $('#pingNames').val().replace('\n', '').replace('\r', '')
			chatSettings.triggers = triggers
			saveSettings()
		})

		$('#pingURL').blur(() => {
			chatSettings.audioUrl = $('#pingURL').val()
			rph.sounds.notify = new Audio(chatSettings.audioUrl)
			saveSettings()
		})

		$('#pingTextColor').blur(() => {
			let colorInput = $('#pingTextColor').val()
			if (validateColor(colorInput) === true) {
				chatSettings.color = colorInput
				generateHighlightStyle()
				saveSettings()
			} 
		})

		$('#pingHighlightColor').blur(() => {
			if (validateSetting('#pingHighlightColor', 'color') === true) {
				chatSettings.highlight = $('#pingHighlightColor').val()
				generateHighlightStyle()
				saveSettings()
			}
		})

		$('#pingBoldEnable').change(() => {
			chatSettings.bold = $('#pingBoldEnable').is(':checked')
			generateHighlightStyle()
			saveSettings()
		})

		$('#pingItalicsEnable').change(() => {
			chatSettings.italics = $('#pingItalicsEnable').is(':checked')
			generateHighlightStyle()
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

		$('#pingPreviewInput').keyup(() => {
			let msg = $('#pingPreviewInput').val()
			let testRegex = matchPing(msg)
			if (testRegex !== null) {
				msg = msg.replace(testRegex, `<span style="${pingHighlightText}">${msg.match(testRegex)}</span>`)
				rph.sounds.notify.play()
				$('#pingPreviewText').html(` &nbsp;${msg}`)
			} else {
				$('#pingPreviewText').html(` No match`)
			}
		})

		/* Session Options */
		$('#trackSession').click(() => {
			chatSettings.trackSession = $('#trackSession').is(':checked')
			if (chatSettings.trackSession) {
				chatSettings.session = rph.roomsJoined
			}
			else {
				chatSettings.session = []
			}
			saveSettings() 
		})

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

		if (chatSettings.joinFavorites || chatSettings.trackSession) {
			autoJoinTimer = setInterval(autoJoiningHandler, AUTOJOIN_INTERVAL)
		}

		/* Die roller */
		$('#dieRollButton').click(() => {
			const DIE_COUNT = $('#rpht_dieRollerCount').val()
			const DIE_SIDES = $('#rpht_dieRollerSides').val()
			$(`textarea.${$('li.tab.active')[0].className.split(' ')[2]}.active`).val(`/roll ${DIE_COUNT}d${DIE_SIDES}`)
			$(`textarea.${$('li.tab.active')[0].className.split(' ')[2]}.active`).trigger({type: 'keydown', which: 13, keyCode: 13})
			$('#diceRollerPopup').hide()
		})

		$('#coinFlipButton').click(() => {
			$(`textarea.${$('li.tab.active')[0].className.split(' ')[2]}.active`).val(`/coinflip`)
			$(`textarea.${$('li.tab.active')[0].className.split(' ')[2]}.active`).trigger({type: 'keydown', which: 13, keyCode: 13})
			$('#diceRollerPopup').hide()
		})

		$('#diceRollerClose').click(() => {
			$('#diceRollerPopup').hide()
		})

		/* General intialization */
		$(window).resize(resizeChatTabs)

		socket.on('confirm-room-join', (data) => {
			roomSetup(data)
			if (chatSettings.trackSession && joinedSession) {
				chatSettings.session = rph.roomsJoined
				saveSettings() 
			}
		})

		socket.on('room-users-leave', () => {
			if (chatSettings.trackSession && joinedSession) {
				chatSettings.session = rph.roomsJoined
				saveSettings() 
			}
		})

		socket.on('msg', (data) => {
			for (let dataIdx = 0; dataIdx < data.length; dataIdx++) {
				const msgData = data[(data.length - 1) - dataIdx]
				let thisRoom = getRoom(msgData.room)
				let messages = $(`div[data-roomname="${msgData.room}"]`).children()
				for (let idx = ((messages.length - 2) - dataIdx); idx > 0; idx--) {
					let message = messages[idx]
					
					message.children[0].children[0].innerHTML = createTimestamp(msgData.time)
					if ($(message.children[0].children[0]).attr('data-userid') == msgData.userid) {
						processMsg(thisRoom, msgData, message, isRoomMod[msgData.room])
						break
					}
				}
			}
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
				let namesToIds = getSortedNames()
				for (let name in namesToIds) {
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
		let thisRoom = getRoom(room.room)
		let userId = getIdFromChatTab(thisRoom)

		/* This is to filter out double room leaving. */
		thisRoom.userLeave = (function () {
			let cached_function = thisRoom.userLeave;
			return function () {
				if (thisRoom.users.indexOf(arguments[0]) > -1) {
					cached_function.apply(this, arguments); 
				}
			};
		}());

		thisRoom.$tabs[thisRoom.$tabs.length - 1].click(() => {
			for (let roomTab of thisRoom.$tabs) {
				roomTab.removeAttr('style')
			}
		})

		const NUM_USERS = account.userids.length
		for (let idx = 0; idx < NUM_USERS && !isRoomMod[room.room]; idx++) {
			if (thisRoom.props.mods.indexOf(account.userids[idx]) > -1 ||
				thisRoom.props.owners.indexOf(account.userids[idx]) > -1) {
				isRoomMod[room.room] = true
				break
			}
		}

		getUserById(userId, (User) => {
			const moddingModule = rphToolsModule.getModule('Modding Module')
			if (moddingModule !== null && isRoomMod[room.room]) {
				moddingModule.addModRoomPair(User.props, thisRoom.props.name)
			}

			/* Set up room tab and input box */
			let roomCss = getCssRoomName(thisRoom.props.name)
			let chatTextArea = $(`textarea.${User.props.id}_${roomCss}`)
			let tabsLen = thisRoom.$tabs.length
			let idRoomName = thisRoom.$tabs[tabsLen - 1][0].className.split(' ')[2]
			thisRoom.$tabs[tabsLen - 1].prepend(`<p style="font-size: x-small; height:16px; margin-top: -10px;">${User.props.name}</p>`)
			$(`textarea.${idRoomName}`).prop('placeholder', `Post as ${User.props.name}`)
			$(`div.${User.props.id}_${roomCss} .user-for-textarea span`).css('overflow', 'hidden')
			$(`div.${User.props.id}_${roomCss} .user-for-textarea div`)
				.css('width', '234px')
				.append(`<span class="${User.props.id}_${roomCss} roller-button" style="cursor:pointer; float: right; width: auto;" title="Dice roller">🎲</span>`)
			$(`span.${User.props.id}_${roomCss}.roller-button`).click(()=> {
				$('#diceRollerPopup').toggle()
			})

			/* Setup popups and tooltips */
			$(`li.${User.props.id}_${roomCss} a.close`).click(() => {
				$('#chatCommandTooltip').hide()
				$('#diceRollerPopup').hide()
			})
			chatTextArea.unbind('keyup')
			chatTextArea.bind('keydown', (ev) => {
				intputChatText(ev, User, thisRoom)
			})
			chatTextArea.on('input', () => {
				const chatInput = chatTextArea.val().trim()
				$('#chatCommandTooltip').hide()
				if (chatInput[0] === '/') {
					const commandTable = buildComamndTable(chatTextArea.val().trim())
					$('#chatCommandTooltip').html(commandTable).show()
				}
			})

			/* Adjust chat tab size */
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

		if (!thisRoom.active && msgData.room === thisRoom.props.name) {
			$(`li.tab.tab-${getCssRoomName(thisRoom.props.name)}`).css('border-bottom', '4px solid #ADF')
			for (let roomTab of thisRoom.$tabs) {
				$(roomTab.children()[2]).hide()
			}
		}

		getUserById(msgData.userid, (user) => {
			let newMsgLines = contentLines.slice(contentLines.length - msgLineCount)

			for (let msgIdx = 0; msgIdx < newMsgLines.length; msgIdx++) {
				if (newMsgLines[msgIdx].indexOf('\u200b') === -1) {
					continue
				}

				const SEED = newMsgLines[msgIdx].split('\u200b')[1]
				const MSG_CHUNKS = newMsgLines[msgIdx].split(/ /g)
				let validResult = true
				newMsgLines[msgIdx] = newMsgLines[msgIdx].substring(0, newMsgLines[msgIdx].indexOf(' @\u200b'))

				/* If the RNG was a dice roll, verify the roll by running the RNG with the same seed */
				if (newMsgLines[msgIdx].search('rolled') > -1) {
					const ROLL_PARAMS = parseRoll(MSG_CHUNKS[2])
					const ROLL_RESULTS = calculateDiceRolls(ROLL_PARAMS[0], ROLL_PARAMS[1], SEED)
					for(let idx = 0; idx < ROLL_PARAMS[0] && validResult; idx++) {
						validResult = !(ROLL_RESULTS['results'][idx] !== parseInt(MSG_CHUNKS[idx + 3]))
					}
				}
				else if (newMsgLines[msgIdx].search('flips' > -1)) {
					const outcomes = ['heads', 'tails']
					let outcome = outcomes[LcgRng(SEED) % 2]
					validResult = (newMsgLines[msgIdx].search(outcome) >- 1)
				}

				if (validResult === false) {
					newMsgLines[msgIdx] += ` <span style="background:#F44; color: #FFF;" title="Do not use this result">&#9746;</span>`
				}
				else if (msgData.time - SEED > (RNG_TIMEOUT)) {
					newMsgLines[msgIdx] += ` <span style="background:#FFD800; color: #000;" title="This result is outdated">&#9072;</span>`
				}
				else {
					newMsgLines[msgIdx] += ` <span style="background:#4A4; color: #FFF;" title="This result is good">&#9745;</span>`
				}
			}

			let newMsg = ``
			if (contentLines.length !== 1 && !('buffer' in msgData)){
				newMsg += `<br>`
			}
			newMsg += `${newMsgLines.join('<br>')}`

			if (!msgData.buffer) {
				const selfMsg = account.userids.includes(msgData.userid)
				let notificationTrigger = 0
				if (chatSettings.enablePings &&
					((chatSettings.selfPing && selfMsg === true) || selfMsg === false)) 
				{
					let testRegex = matchPing(newMsg)
					if (testRegex) {
						newMsg = newMsg.replace(testRegex, `<span style="${pingHighlightText}">${newMsg.match(testRegex)}</span>`)
						rph.sounds.notify.play()
						notificationTrigger = 1

						if (chatSettings.pingNotify && thisRoom.active === false) {
							displayNotification(
								`${user.props.name} pinged you in ${thisRoom.props.name}`,
								chatSettings.notifyTime)
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
						newMsg = newMsg.replace(alertRegex, `<span style="${ALERT_HIGHLIGHT}">${newMsg.match(alertRegex)}</span>`)
						moddingModule.playAlert()
						notificationTrigger = 2
					}
				}

				if (thisRoom.active === false && notificationTrigger > 0) {
					let background = (notificationTrigger === 2) ? '#F00' : chatSettings.highlight
					let textColor = (notificationTrigger === 2) ? '#FFF' : chatSettings.color

					$(`li.tab.tab-${getCssRoomName(thisRoom.props.name)}`).css({
						'background-color': background,
						'color': textColor
					})
				}
			}
			/* Add pings if 
			   - It's enabled AND 
			   - The message isn't a buffer from the server AND
			   - ((self pinging is enabled AND the message is owned by self) OR it's another's) */


			contentQuery.html(`${prevMsgs.join('<br>')} ${newMsg}`)

			if (chatSettings.colorText) {
				const fadeTypes = ['', 'vertical-fade', 'horizontal-fade', 'radial-fade']
				const colorClasses = ['', 'two-color', 'three-color']
				let classString = `${contentQuery[0].className}`
				let styleString = `color: #${user.props.color[0]};`

				classString += ` ${colorClasses[user.props.color.length - 1]}`
				if (!chatSettings.colorSimpleText) {
					styleString += `--color1: #${user.props.color[0]}; --color2: #${user.props.color[1]};` || ''
					styleString += `--color3: #${user.props.color[2]};` || ''
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
			$('#chatCommandTooltip').addClass('rpht-tooltip-common')
		}
		else {
			$('#chatCommandTooltip').removeClass('rpht-tooltip-common')
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
		let newMessage = inputTextBox.val()
		let error = false
		let cmdArgs = newMessage.split(/ (.+)/)

		switch (cmdArgs[0]) {
			case '/status':
			case '/away':
				if (cmdArgs.length != 3) {
					error = true
				} else {
					let type = 0
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
				{
					const outcomes = ['heads', 'tails']
					const seed = new Date().getTime()
					let resultMsg = `/me flips a coin. It lands on... **${outcomes[LcgRng(seed) % 2]}**! @&#8203;${seed}`
					Room.sendMessage(resultMsg, User.props.id)
				}
				break
			case '/roll':
				{
					const seed = new Date().getTime()
					let diceArgs = [1, 20]
					let resultMsg = `/me `
					let results = []
					let result = LcgRng(seed)

					if(cmdArgs[1]) {
						diceArgs = parseRoll(cmdArgs[1])
					}

					results.push(result % diceArgs[1] + 1)
					for (let die = 1; die < diceArgs[0]; die++) {
						result = LcgRng(result)
						results.push(result % diceArgs[1] + 1)
					}
					total = results.reduce((a, b) => a + b, 0)
					resultMsg += `rolled ${diceArgs[0]}d${diceArgs[1]}: ${results.join(' ')} (total: ${total}) @&#8203;${seed}`
					Room.sendMessage(resultMsg, User.props.id)
				}
				break
			case '/rps':
				{
					const results = ['Rock!', 'Paper!', 'Scissors!']
					newMessage = `/me plays Rock, Paper, Scissors and chooses... ${results[Math.ceil(Math.random() * 3) % 3].toString()}`
					Room.sendMessage(newMessage, User.props.id)
				}
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
				let moddingModule = rphToolsModule.getModule('Modding Module')
				if (cmdArgs.length < 2) {
					error = true
				} else if (moddingModule) {
					let action = cmdArgs[0].substring(1, cmdArgs[0].length)
					let commaIdx = cmdArgs[1].indexOf(',')
					let targetName = cmdArgs[1]
					let reason = ''
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
				parseSlashCommand(inputTextarea, Room, User);
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
		const pingNames = triggers.split(',')
		const regexParam = (caseSensitive ? "m" : 'im')
		for (i = 0; i < pingNames.length; i++) {
			let trigger = pingNames[i].trim()
			if (trigger === "") {
				continue
			}
			const regexPattern = (exactMatch) ? `\\b${trigger}\\b` : trigger
			const urlRegex = new RegExp(`href=".*?${trigger}.*?"`, '')
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
	 * Gets the user's ID from the chat tab (it's in the class)
	 * @param {} thisRoom - Room to get the ID from
	 **/
	function getIdFromChatTab(thisRoom) {
		let tabsLen = thisRoom.$tabs.length
		let className = thisRoom.$tabs[tabsLen - 1][0].className
		let charID = className.match(new RegExp(' [0-9]+', ''))[0]
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

	function generateHighlightStyle() {
		pingHighlightText = `color: ${chatSettings.color}; background: ${chatSettings.highlight};`
		if (chatSettings.bold === true) {
			pingHighlightText += ' font-weight: bold;'
		}
		if (chatSettings.italics === true) {
			pingHighlightText += ' font-style:italic;'
		}
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
		$('<div id="rpht-autojoin" class="inner" style="background: #333;">' +
			'<p>Autojoining or restoring session in about 5 seconds.</p>' +
			'<p>Press "Cancel" to stop.</p>' +
			'</div>'
		).dialog({
			open: function (event, ui) {
				setTimeout(() => {
					$('#rpht-autojoin').dialog('close')
				}, AUTOJOIN_TIMEOUT_SEC)
			},
			buttons: {
				Cancel: () => {
					joinedSession = true
					chatSettings.session = []
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
		if (chatSettings.trackSession === true) {
			joinPreviousSession()
		}
	}

	function joinFavoriteRooms() {
		chatSettings.favRooms.forEach((favRoom) => {
			socket.emit('join', {
				name: favRoom.room,
				userid: favRoom.userId,
				pw: favRoom.roomPw
			})
		})
	}

	function joinPreviousSession() {
		const sessionLen = chatSettings.session.length
		for(let i = 0; i < sessionLen; i++) {
			const favoritesLen = chatSettings.favRooms.length
			const sessionRoom = chatSettings.session[i]
			let canJoin = true

			for(let j = 0; chatSettings.joinFavorites && j < favoritesLen; j++) {
				const favRoom = chatSettings.favRooms[j]
				if (favRoom.name == sessionRoom.roomname && 
					favRoom.userId == sessionRoom.user) {
					canJoin = false
					break
				}
			}

			if (canJoin) {
				socket.emit('join', {
					name: sessionRoom.roomname,
					userid: sessionRoom.user
				})
			}
		}
		joinedSession = true
	}

	/** 
	 * Adds an entry to the Favorite Chat Rooms list from an input
	 * @param {string} roomname - Name of the room
	 */
	function parseFavoriteRoom(roomname) {
		let room = getRoom(roomname)
		if (room === undefined) {
			markProblem('favRoom', true)
			return
		}
		if (chatSettings.favRooms.length < MAX_ROOMS) {
			let selectedFav = $('#favUserDropList option:selected')
			let hashStr = $('#favRoom').val() + selectedFav.html()
			let favRoomObj = {
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
		let favItem = document.getElementById("favRoomsList")
		let favItemId = $('#favRoomsList option:selected').val()
		favItem.remove(favItem.selectedIndex)
		for (let idx = 0; idx < chatSettings.favRooms.length; idx++) {
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

			'enablePings': true,
			'pingNotify': false,
			'selfPing': false,
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
			'trackSession': false,
			'favRooms': [],
			'session': [],
		}
		if (storedSettings) {
			chatSettings = Object.assign(chatSettings, storedSettings)
		}

		$('#chatColorEnable').prop("checked", chatSettings.colorText)
		$('#chatSimpleColorEnable').prop("checked", chatSettings.colorSimpleText)
		$('#chatmsgPaddingEnable').prop("checked", chatSettings.msgPadding)

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

		$('#trackSession').prop("checked", chatSettings.trackSession)
		$('#joinFavEnable').prop("checked", chatSettings.joinFavorites)
		for (let i = 0; i < chatSettings.favRooms.length; i++) {
			let favRoomObj = chatSettings.favRooms[i]
			$('#favRoomsList').append(
				'<option value="' + favRoomObj._id + '">' +
				favRoomObj.user + ": " + favRoomObj.room + '</option>'
			)
		}

		generateHighlightStyle()
		rph.sounds.notify = new Audio(chatSettings.audioUrl)
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'Chat Module'
	}

	return {
		init: init,
		loadSettings: loadSettings,
		getHtml: getHtml,
		toString: toString
	}
}());