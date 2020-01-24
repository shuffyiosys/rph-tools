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

/**
 * Modified handler for keyup events from the chat textbox
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

	if (message[0] === '/' && message.substring(0, 2) !== '//' && chatModule) {
		chatModule.parseSlashCommand(inputTextarea, Room, User);
	} else {
		Room.sendMessage(message, User.props.id)
	}
	inputTextarea.val('')

	let thisTab = rph.tabs[User.props.id]
	let newLength = message.length
	let curTime = Math.round(new Date().getTime() / 1000)

	if (message.includes('\n')) {
		newLength = newLength + (message.split('\n').length * 250)
	}
	thisTab.bufferLength = (thisTab.bufferLength / (curTime - thisTab.lastTime + 1)) + ((newLength + thisTab.bufferLength) / 3) + 250
	thisTab.lastTime = curTime
	if (thisTab.bufferLength > 1750) {
		thisTab.offenses += 1
	}

	if (thisTab.offenses > 2) {
		Room.sendMessage('Flood kick', User.props.id)
		socket.disconnect()
	} else if (thisTab.offenses === 2) {
		Room.appendMessage(
			'<span class="first">&nbsp;</span>\n\
		<span title="' + makeTimestamp(false, true) + '">You are flooding. Be careful or you\'ll be kicked</span>'
		).addClass('sys')
		setTimeout(() => {
			thisTab.offenses = 0
		}, 15000)
	}
}