/**
 * Generates a hash value for a string
 * This was modified from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 */
String.prototype.hashCode = function () {
	let hash = 0,
		i, chr, len
	if (this.length === 0) return hash
	for (i = 0, len = this.length; i < len; i++) {
		chr = this.charCodeAt(i)
		hash = ((hash << 31) - hash) + chr
		hash |= 0; // Convert to 32bit integer
	}
	return hash
}

function floodTracker(User, Room, message) {
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
		<span title="">You are flooding. Be careful or you\'ll be kicked</span>'
		).addClass('sys')
		setTimeout(() => {
			thisTab.offenses = 0
		}, 15000)
	}

	return thisTab.offenses > 2
}
