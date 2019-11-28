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
}