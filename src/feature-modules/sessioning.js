/**
 * This module handles the "Session" section in RPH Tools
 */
let sessionModule = (function () {
	let sessionSettings = {
		'autoRefreshAttempts': 5,
		'dcHappened': false,
		'autoRefresh': false,
		'chatTextboxSave': false,
		'pmTextboxSave': false,
		'refreshSecs': 15,
		'joinFavorites': false,
		'joinSession': false,
		'roomSession': [],
		'favRooms': [],
		'chatTextboxes': [],
		'pmTextboxes': []
	}

	let localStorageName = "sessionSettings"

	let autoJoinTimer = null

	let sessionShadow = []

	let MAX_ROOMS = 30

	let AUTOJOIN_TIMEOUT_SEC = 5 * 1000

	let MAX_AUTO_REFRESH_ATTEMPTS = 5

	let REFRESH_ATTEMPTS_TIMEOUT = 10 * 60 * 1000

	let AUTOJOIN_INTERVAL = 2 * 1000

	let html = {
		'tabId': 'session-module',
		'tabName': 'Sessions',
		'tabContents': '<h3>Sessions</h3>' +
			'<div>' +
			'<h4>Auto Refresh</h4> <strong>Note:</strong> This will not re-join rooms with passwords.' +
			'<br /><br />' +
			'<label class="rpht_labels">Refresh on Disconnect: </label><input style="width: 40px;" type="checkbox" id="dcRefresh" name="dcRefresh">' +
			'<br /><br />' +
			'<label class="rpht_labels">Auto-refresh time: </label><input style="width: 64px;" type="number" id="refreshTime" name="refreshTime" max="60" min="5" value="10"> seconds' +
			'<br /><br />' +
			'<label class="rpht_labels">Save Chatbox Inputs: </label><input style="width: 40px;" type="checkbox" id="chatTextboxSave" name="roomSessioning">' +
			'<br /><br />' +
			'<label class="rpht_labels">Save PM Inputs: </label><input style="width: 40px;" type="checkbox" id="pmTextboxSave" name="roomSessioning">' +
			'<br />' +
			'<label class="rpht_labels" style="font-size: 12px; text-align: left;">This may not restore the inputs correctly if you have a PM open, but not an active session with the person.' + 
			'<br />' +
			'e.g., you\'ve started a new PM, but did not send one yet.</label>' +
			'<br /><br />' +
			'<button style="margin-left: 310px;" type="button" id="resetSession">Reset Session</button>' +
			'</div><div>' +
			'<h4>Auto Joining</h4>' +
			'<label class="rpht_labels">Join favorites: </label><input style="width: 40px;" type="checkbox" id="favEnable" name="favEnable">' +
			'<br /><br />' +
			'<label class="rpht_labels">Restore last session: </label><input style="width: 40px;" type="checkbox" id="roomSessioning" name="roomSessioning">' +
			'<br /><br />' +
			'<label class="rpht_labels">Username: </label><select style="width: 300px;" id="favUserDropList"></select>' +
			'<br /><br />' +
			'<label class="rpht_labels">Room:  </label><input  type="text" id="favRoom" name="favRoom">' +
			'<br /><br />' +
			'<label class="rpht_labels">Password: </label><input  type="text" id="favRoomPw" name="favRoomPw">' +
			'<br /><br />' +
			'<button style="margin-left: 586px;" type="button" id="favAdd">Add</button>' +
			'<p>Favorite rooms</p>' +
			'<select style="width: 611px;" id="favRoomsList" size="10"></select><br><br>' +
			'<button style="margin-left: 560px;" type="button" id="favRemove">Remove</button>' +
			'<br>' +
			'</div>'
	}

	function init() {
		loadSettings()

		$('#dcRefresh').click(() => {
			sessionSettings.autoRefresh = getCheckBox('#dcRefresh')
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		$('#refreshTime').change(() => {
			sessionSettings.refreshSecs = $('#refreshTime').val()
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		$('#chatTextboxSave').click( () => {
			sessionSettings.chatTextboxSave = getCheckBox('#chatTextboxSave')
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		$('#pmTextboxSave').click( () => {
			sessionSettings.pmTextboxSave = getCheckBox('#pmTextboxSave')
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		$('#roomSessioning').click(() => {
			sessionSettings.joinSession = getCheckBox('#roomSessioning')
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		$('#favEnable').click(() => {
			sessionSettings.joinFavorites = getCheckBox('#favEnable')
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		$('#favAdd').click(() => {
			parseFavoriteRoom($('#favRoom').val())
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		$('#favRemove').click(() => {
			removeFavoriteRoom()
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		$('#resetSession').click(() => {
			clearRoomSession()
			settingsModule.saveSettings(localStorageName, sessionSettings)
		})

		if (determineAutojoin()) {
			autoJoinTimer = setInterval(autoJoiningHandler, AUTOJOIN_INTERVAL)
			sessionSettings.dcHappened = false
			settingsModule.saveSettings(localStorageName, sessionSettings)
		} else {
			clearRoomSession()
		}

		setTimeout(() => {
			console.log('RPH Tools[connectionStabilityTimeout] - Connection considered stable')
			sessionSettings.autoRefreshAttempts = MAX_AUTO_REFRESH_ATTEMPTS
			settingsModule.saveSettings(localStorageName, sessionSettings)
		}, REFRESH_ATTEMPTS_TIMEOUT)

		socket.on('restore-pms', () => {
			if (sessionSettings.pmTextboxSave){
				setTimeout(() => {
					let pmTextBoxes = $("#pm-bottom .textarea textarea")
					for (let i = 0; i < pmTextBoxes.length; i++){
						if (sessionSettings.pmTextboxes[i])
							pmTextBoxes[i].value = sessionSettings.pmTextboxes[i]
					}
				}, 1000)
			}
		})

		chatSocket.on('disconnect', () => {
			let chatTextBoxes = $("#chat-bottom .textarea textarea")
			let pmTextBoxes = $("#pm-bottom .textarea textarea")
			sessionSettings.chatTextboxes = []
			sessionSettings.pmTextboxes = []
			for (let i = 0; i < chatTextBoxes.length; i++){
				let textboxInfo = {
					value: chatTextBoxes[i].value,
					className: chatTextBoxes[i].className,
				}
				sessionSettings.chatTextboxes.push(textboxInfo)
			}

			for (let i = 0; i < pmTextBoxes.length; i++){
				sessionSettings.pmTextboxes.push(pmTextBoxes[i].value)
			}

			settingsModule.saveSettings(localStorageName, sessionSettings)

			if (sessionSettings.autoRefresh && sessionSettings.autoRefreshAttempts > 0) {
				setTimeout(() => {
					sessionSettings.autoRefreshAttempts -= 1
					sessionSettings.dcHappened = true
					settingsModule.saveSettings(localStorageName, sessionSettings)
					window.onbeforeunload = null
					window.location.reload(true)
				}, sessionSettings.refreshSecs * 1000)
			} else if (sessionSettings.autoRefresh) {
				$('<div id="rpht-max-refresh" class="inner">' +
					'<p>Max auto refresh attempts tried. You will need to manually refresh.</p>' +
					'</div>'
				).dialog({
					open: function (event, ui) {},
					buttons: {
						Cancel: () => {
							$(this).dialog("close")
						}
					},
				}).dialog('open')
			}
		})

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
	 * Determining auto-joining should be done
	 * 1. Joining favorites & there are favorite rooms
	 * 2. Join last session & there are rooms in the session
	 * 3. Auto refresh & disconnect happened & there are refresh attempts left
	 */
	function determineAutojoin() {
		let autoJoin = false

		if (sessionSettings.joinFavorites === true &&
			sessionSettings.favRooms.length > 0) {
			autoJoin = true
		}

		if (sessionSettings.joinSession === true &&
			sessionSettings.roomSession.length > 0) {
			sessionShadow = sessionSettings.roomSession
			autoJoin = true
		}

		if (sessionSettings.autoRefresh &&
			sessionSettings.dcHappened &&
			sessionSettings.autoRefreshAttempts > 0) {
			sessionShadow = sessionSettings.roomSession
			autoJoin = true
		}

		return autoJoin
	}

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
					$(this).dialog("close")
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
		if (sessionSettings.joinFavorites === true) {
			joinFavoriteRooms()
		}

		setTimeout(() => {
			if (sessionSettings.autoRefresh || sessionSettings.joinSession) {
				console.log('Joining sessioned rooms', sessionShadow)
				clearRoomSession()
				joinSessionedRooms()
			}
		}, 1000)
		clearTimeout(autoJoinTimer)
	}

	/**
	 * Join rooms that were in the last session.
	 */
	function joinSessionedRooms() {
		for (let i = 0; i < sessionShadow.length; i++) {
			let room = sessionShadow[i]
			let roomJoined = arrayObjectIndexOf(rph.roomsJoined, 'roomname', room.roomname) > -1
			let userJoined = arrayObjectIndexOf(rph.roomsJoined, 'user', room.user) > -1
			let alreadyInRoom = roomJoined && userJoined
			if (!alreadyInRoom) {
				chatSocket.emit('join', {
					name: room.roomname,
					userid: room.user
				})
			}
		}

		delete sessionShadow
		if (sessionSettings.chatTextboxSave){
			populateChatTextboxes()
		}
	}

	/** 
	 * Joins all the rooms in the favorite rooms list
	 */
	function joinFavoriteRooms() {
		for (let i = 0; i < sessionSettings.favRooms.length; i++) {
			let favRoom = sessionSettings.favRooms[i]
			chatSocket.emit('join', {
				name: favRoom.room,
				userid: favRoom.userId,
				pw: favRoom.roomPw
			})
		}

		if (sessionSettings.chatTextboxSave){
			populateChatTextboxes()
		}
	}

	function populateChatTextboxes () {
		setTimeout(() => {
			let chatTextBoxes = $("#chat-bottom .textarea textarea")
			for (let i = 0; i < chatTextBoxes.length; i++){
				let idx = arrayObjectIndexOf(sessionSettings.chatTextboxes, 'className', chatTextBoxes[i].className)
				if (idx > -1) {
					chatTextBoxes[i].value = sessionSettings.chatTextboxes[idx].value
				}
			}
		}, 250)
	}

	function addRoomToSession(roomname, userid) {
		let alreadyInSession = false
		let roomSession = sessionSettings.roomSession
		for (let i = 0; i < roomSession.length && alreadyInSession === false; i++) {
			let room = roomSession[i]
			if (room.roomname == roomname && room.user == userid) {
				alreadyInSession = true
			}
		}

		if (!alreadyInSession) {
			console.log('RPH Tools[addRoomToSession]: Adding room to session:', roomname, userid)
			sessionSettings.roomSession.push({
				'roomname': roomname,
				'user': userid
			})
			settingsModule.saveSettings(localStorageName, sessionSettings)
		}
	}

	function removeRoomFromSession(roomname, userid) {
		let roomSession = sessionSettings.roomSession
		for (let i = 0; i < roomSession.length; i++) {
			let room = roomSession[i]
			if (room.roomname == roomname && room.user == userid) {
				console.log('RPH Tools[removeRoomFromSession]: Removing room -', room)
				sessionSettings.roomSession.splice(i, 1)
				settingsModule.saveSettings(localStorageName, sessionSettings)
			}
		}
	}

	/**
	 * Clear the room session.
	 */
	function clearRoomSession() {
		sessionSettings.roomSession = []
		settingsModule.saveSettings(localStorageName, sessionSettings)
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

		if (sessionSettings.favRooms.length < MAX_ROOMS) {
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
		if (arrayObjectIndexOf(sessionSettings.favRooms, "_id", favRoomObj._id) === -1) {
			$('#favRoomsList').append(
				'<option value="' + favRoomObj._id + '">' +
				favRoomObj.user + ": " + favRoomObj.room + '</option>'
			)
			sessionSettings.favRooms.push(favRoomObj)
		}
		if (sessionSettings.favRooms.length >= MAX_ROOMS) {
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
		for (let idx = 0; idx < sessionSettings.favRooms.length; idx++) {
			if (sessionSettings.favRooms[idx]._id == favItemId) {
				sessionSettings.favRooms.splice(idx, 1)
				break
			}
		}
		if (sessionSettings.favRooms.length < 10) {
			$('#favAdd').text("Add")
			$('#favAdd')[0].disabled = false
		}
	}

	function loadSettings() {
		let storedSettings = settingsModule.getSettings(localStorageName)

		if (storedSettings) {
			for (let key in storedSettings) {
				sessionSettings[key] = storedSettings[key]
			}
		}
		else {
			sessionSettings = {
				'autoRefreshAttempts': 5,
				'dcHappened': false,
				'autoRefresh': false,
				'refreshSecs': 15,
				'joinFavorites': false,
				'joinSession': false,
				'roomSession': [],
				'favRooms': [],
			}
		}

		$('#favRoomsList').empty()

		$('#dcRefresh').prop("checked", sessionSettings.autoRefresh)
		$('#refreshTime').val(sessionSettings.refreshSecs)
		$('#chatTextboxSave').prop("checked", sessionSettings.chatTextboxSave)
		$('#pmTextboxSave').prop("checked", sessionSettings.pmTextboxSave)
		$('input#favEnable').prop("checked", sessionSettings.joinFavorites)
		$('#roomSessioning').prop("checked", sessionSettings.joinSession)

		for (let i = 0; i < sessionSettings.favRooms.length; i++) {
			let favRoomObj = sessionSettings.favRooms[i]
			$('#favRoomsList').append(
				'<option value="' + favRoomObj._id + '">' +
				favRoomObj.user + ": " + favRoomObj.room + '</option>'
			)
		}

		if (sessionSettings.favRooms.length >= MAX_ROOMS) {
			$('#favAdd').text("Favorites Full")
			$('#favAdd')[0].disabled = true
		}
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'Session Module'
	}

	return {
		init: init,
		addRoomToSession: addRoomToSession,
		removeRoomFromSession: removeRoomFromSession,
		loadSettings: loadSettings,
		getHtml: getHtml,
		toString: toString
	}
}());