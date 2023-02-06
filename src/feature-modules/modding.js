const moddingModule = (function () {
const localStorageName = "modSettings";
const html = {
	tabId: 'modding-module',
	tabName: 'Modding',
	tabContents:
		`<h3>Moderator Control</h3><br>
		<h4>Shortcuts</h4>
		<div class="rpht-option-block">
			<p><strong>Note:</strong> This must be done with the mods chat tab selected.</p>
			<p>General form: <code>/[action] [username],[reason]</code>. The reason is optional.</p>
			<p>Example: <code>/kick Alice,Being rude</code></p>
			<p>Supported actions: kick, ban, unban, add-mod, remove-mod, add-owner, remove-owner</p>
		</div>
		<h4>Mod commands</h4>
		<div class="rpht-option-block">
			<div class="rpht-option-section">
				<label class="rpht-label split-input-label">Room-Name pair</label>
				<select class="split-input-label" id="roomModSelect"><option value="">&lt;Blank out fields&gt;</option></select><br /><br />
				<label class="rpht-label split-input-label">Room:</label><input class="split-input-label" type="text" id="modRoomTextInput" placeholder="Room"><br /><br />
				<label class="rpht-label split-input-label">Mod name:</label><input class="split-input-label" type="text" id="modFromTextInput" placeholder="Your mod name"><br /><br />
				<label class="rpht-label split-input-label">Reason Message:</label><input class="split-input-label" type="text" id="modMessageTextInput" placeholder="Message"><br /><br />
			</div>
			<div class="rpht-option-section option-section-bottom">
				<p>Perform action on these users (comma separated): </p>
				<textarea name="modTargetTextInput" id="modTargetTextInput" rows=2 class="rpht_textarea"></textarea>
				<br /><br />

				<div style="display: grid; grid-template-columns: auto auto auto auto;">
					<div>
						<button type="button" id="kickButton" class="rpht-mod-button" style="background: #F00;" dataAction="kick">Kick</button><br />
						<button type="button" id="banButton" class="rpht-mod-button" style="background: #F00;" dataAction="ban">Ban</button><br />
						<button type="button" id="unbanButton" class="rpht-mod-button" style="background: #F00;" dataAction="unban">Unban</button>
					</div>
					<div>
						<button type="button" id="addModButton" class="rpht-mod-button" dataAction="add-mod">Add Mod</button><br>
						<button type="button" id="removeModButton" class="rpht-mod-button" dataAction="remove-mod">Remove Mod</button>
						<br>
						<button type="button" id="resetPwButton" class="rpht-mod-button">Reset PW</button>
					</div>
					<div>
						<button type="button" id="addOwnerButton" class="rpht-mod-button" dataAction="add-owner">Add Owner</button><br>
						<button type="button" id="removeOwnerButton" class="rpht-mod-button" dataAction="remove-owner">Remove Owner</button>
					</div>
				</div>

			</div>
		</div>
		<h4>Word Alert</h4>
		<div class="rpht-option-block">
			<div class="rpht-option-section">
				<label class="rpht-label checkbox-label" for="wordAlertEnable">Enable word alerting</label>
				<label class="switch"><input type="checkbox" id="wordAlertEnable"><span class="rpht-slider round"></span></label>
				<label class="rpht-label descript-label">Highlights words that you want to be pinged on for moderation</label>
			</div>
			<div class="rpht-option-section option-section-bottom">
				<p><strong>Note:</strong> Separate all entries with a pipe character ( | ).</p>
				<textarea name="alertTriggers" id="alertTriggers" rows=4 class="rpht_textarea"></textarea>
			</div>
		</div>`
}

let settings = {};
let roomNamePairs = {};

function init() {
	loadSettings();
	
	$('#roomModSelect').change(() => {
		let roomModeIdx = $('#roomModSelect')[0].selectedIndex;
		let roomModVal = $('#roomModSelect')[0].options[roomModeIdx].value;
		if (roomNamePairs[roomModVal]) {
			$('input#modRoomTextInput').val(roomNamePairs[roomModVal].roomName);
			$('input#modFromTextInput').val(roomNamePairs[roomModVal].modName);
		} 
		else {
			$('input#modRoomTextInput').val('');
			$('input#modFromTextInput').val('');
		}
	})

	$('#resetPwButton').click(async function () {
		const room = $('input#modRoomTextInput').val();
		const user = await getUserByName($('input#modFromTextInput').val());
		socket.emit('modify-room', {
		    room: room,
		    userid: user.props.id,
		    props: { pw: false }
		});
	})

	$('#kickButton').click(modAction);
	$('#banButton').click(modAction);
	$('#unbanButton').click(modAction);
	$('#addModButton').click(modAction);
	$('#removeModButton').click(modAction);
	$('#addOwnerButton').click(modAction);
	$('#removeOwnerButton').click(modAction);

	$('#wordAlertEnable').click(function () {
		settings.alertEnabled = $('#wordAlertEnable').is(':checked');
		settingsModule.saveSettings(localStorageName, settings);
	})

	$('#modAlertWords').blur(function () {
		settings.alertWords = $('#modAlertWords').val().replace(/\r?\n|\r/, '')
		settingsModule.saveSettings(localStorageName, settings);
	})
}

function modAction(ev) {
	const action = $(ev.target).attr('dataAction');
	const vanityMap = getVanityNamesToIds();
	let targets = $('#modTargetTextInput').val().replace(/\r?\n|\r/, '')
	targets = targets.split(',')
	console.log('RPH Tools[modAction]: Performing', action, 'on', targets)
	targets.forEach(function (target) {
		if (vanityMap[target]) {
			target = messenger.users[vanityMap[target]].props.name
		}
		emitModAction(action, target, $('input#modFromTextInput').val(),
			$('input#modRoomTextInput').val(),
			$("input#modMessageTextInput").val())
	})
}

async function emitModAction(action, targetName, modName, roomName, reasonMsg) {
	const targetUser = await getUserByName(targetName);
	const modUser = await getUserByName(modName);

	let modMessage = ''
	if (action === 'kick' || action === 'ban' || action === 'unban') {
		modMessage = reasonMsg;
	}
	socket.emit(action, {
		room: roomName,
		userid: modUser.props.id,
		targetid: targetUser.props.id,
		msg: modMessage
	});
}

function findUserAsMod(userObj) {
	Object.keys(rph.rooms).forEach((roomname) => {
		let roomProps = getRoom(roomname).props
		if (roomProps.mods.indexOf(userObj.props.id) > -1 ||
		    roomProps.owners.indexOf(userObj.props.id) > -1)
		{
			addModRoomPair(userObj.props, roomname);
		}
	})
}

function addModRoomPair(userProps, roomName) {
	let roomNamePair = roomName + ': ' + userProps.name
	let roomNameValue = roomName + '.' + userProps.id
	let roomNameObj = {
	    roomName: roomName,
	    modName: userProps.name,
	    modId: userProps.id
	}

	if (roomNamePairs[roomNameValue] === undefined) {
		roomNamePairs[roomNameValue] = roomNameObj;
		$('#roomModSelect').append(`<option value="${roomNameValue}">${roomNamePair}</option>`);
	}
}

function getVanityNamesToIds() {
	let vanityToIds = {}
	for(let user in messenger.users){
		let vanityName = messenger.users[user].props.vanity
		if(vanityName)
		vanityToIds[vanityName] = user
	}
	return vanityToIds
}

function loadSettings() {
	settings = {
		'alertEnabled': false,
		'alertWords': '',
	}
	let storedSettings = settingsModule.getSettings(localStorageName);

	if (storedSettings) {
		settings = Object.assign(settings, storedSettings);
	}

	$('#modAlertUrl').val(settings.alertUrl);
	$('#modAlertWords').val(settings.alertWords);
}

function getAlertWords() {
	return settings.alertWords;
}

return {
	init: init,
	emitModAction: emitModAction,
	findUserAsMod: findUserAsMod,
	addModRoomPair: addModRoomPair,
	loadSettings: loadSettings,
	getAlertWords: getAlertWords,
	getHtml: html,
	moduleName: 'modding'
}
}());
