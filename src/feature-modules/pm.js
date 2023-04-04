const pmModule = (function () {
const localStorageName = "pmSettings";
const html = {
	tabId: 'pm-module',
	tabName: 'PMs',
	tabContents: 
		`<h4>PM Settings</h4><br>
		<h5>Appearance</h5>
		<div class="rpht-option-block">
			<div class="rpht-option-section">
				<label class="rpht-label checkbox-label" for="pmColorEnable">Use user text colors</label>
				<label class="switch"><input type="checkbox" id="pmColorEnable" dataName="colorText"><span class="rpht-slider round"></span></label>
				<label class="rpht-label descript-label">Use the user's color to stylize their text</label>
			</div>
			<div class="rpht-option-section option-section-bottom">
				<label class="rpht-label checkbox-label" for="pmSideTabsEnable">Tabs on side</label>
				<label class="switch"><input type="checkbox" id="pmSideTabsEnable" dataName="sideTabs"><span class="rpht-slider round"></span></label>
				<label class="rpht-label descript-label">Puts the PM tabs on the side, listing them vertically. Requires page refresh for changes to take effect</label>
			</div>
		</div>
		<h5>Notifications</h5>
		<div class="rpht-option-block">
			<div class="rpht-option-section">
				<label class="rpht-label checkbox-label" for="pmNotify">Desktop notifications</label>
				<label class="switch"><input type="checkbox" id="pmNotify" dataName="notify"><span class="rpht-slider round"></span></label>
				<p>Pops a desktop notification when you get a PM</p>
			</div>
			<div class="rpht-option-section option-section-bottom">
				<label class="rpht-label split-input-label">PM sound URL</label>
				<input class="split-input-label" type="text" id="pmPingURL" name="pmPingURL" dataName="audioUrl" style="margin-bottom: 12px;">
			</div>
		</div>
		<h5>Away message</h5>
		<div class="rpht-option-block">
			<div class="rpht-option-section option-section-bottom">
				<p>Usernames</p>
				<select style="width: 100%;" id="pmNamesDroplist" size="10"></select><br><br>
				<label><strong>Away Message </strong></label><input type="text" class="rpht-long-input" id="awayMessageTextbox" maxlength="300" placeholder="Away message...">
				<br><br>
				<button type="button" style="float:right; width:60px" id="setAwayButton">Enable</button>
				<button type="button" style="float:right; margin-right: 20px; width:60px" id="removeAwayButton">Disable</button>
			</div>
		</div>`
}

let pmSettings = {};
let awayMessages = {};

function init() {
	loadSettings()

	$('#pmSideTabsEnable').change(saveSetting);
	$('#pmColorEnable').change(saveSetting);
	$('#pmNotify').change(saveSetting);
	$('#pmPingURL').change((ev) => {
		if (validateSetting('#pmPingURL', 'url')) {
			saveSetting(ev);
			rph.sounds.im = new Audio(pmSettings.audioUrl);
		}
	})

	$('#pmNamesDroplist').change(() => {
		let userId = $('#pmNamesDroplist option:selected').val();
		if (awayMessages[userId] !== undefined) {
			$('input#awayMessageTextbox').val(awayMessages[userId].message);
		}
		else {
			$('input#awayMessageTextbox').val('');
		}
	})
	$('#setAwayButton').click(setPmAway);
	$('#removeAwayButton').click(removePmAway);
	$('#pm-msgs span').css('opacity', 0.85);

	socket.on('pm', handlePm);
	socket.on('pm-confirmation', handlePmConfirmation);
	socket.on('account-users', handleAccountUsers);
}

function handlePm(data) {
	if (account.ignores.indexOf(data.to) > -1) {
		return;
	}
	rph.getPm({'from':data.from, 'to':data.to}, async function(pm) {
		const user = await getUserByName(pm.to.props.name);
		processPmMsg(user, data, pm);
		if (pmSettings.notify) {
			const PM_NOTIFY_TIME_MS = 5000;
			displayNotification(
			    `${pm.to.props.name} sent a PM to you for ${pm.from.props.name}`,
			    PM_NOTIFY_TIME_MS
			)
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
}

function handlePmConfirmation(data) {
	rph.getPm({'from':data.to, 'to':data.from}, async function(pm){
		const user = await getUserByName(pm.from.props.name);
		processPmMsg(user, data, pm);

		if (awayMessages[data.to] && awayMessages[data.to].enabled) {
			$('#pmNamesDroplist option')
			    .filter(() => { return this.value == data.to})
			    .css("background-color", "")
			    .html(user.props.name)
			awayMessages[data.to].enabled = false;
		}
		return Promise.resolve(true);
	});
}

function handleAccountUsers() {
	const WAIT_TIME_MS = 3000;
	setTimeout(() => {
		$('#pmNamesDroplist').empty();
		let namesToIds = getSortedNames();
		for (let name in namesToIds) {
			addToDroplist(namesToIds[name], name, "#pmNamesDroplist");
		}
	}, WAIT_TIME_MS);
}

function processPmMsg(user, data, pm) {
	let pmMsgQuery = pm.$msgs[0].childNodes[pm.$msgs[0].childNodes.length - 1];
	const classes = $(pmMsgQuery).attr('class').split(' ');
	if (classes[0] === 'typing-notify') {
		pmMsgQuery = pm.$msgs[0].childNodes[pm.$msgs[0].childNodes.length - 2];
	}

	let nameQuery = $(pmMsgQuery.childNodes[1].childNodes[1]);
	let msgQuery = $(pmMsgQuery.childNodes[1].childNodes[2]);
	let pmCommand = parsePostCommand(data.msg);
	pmMsgQuery.childNodes[1].childNodes[0].innerHTML = createTimestamp(data.date);

	if (pmCommand.includes('rng')) {
		msgQuery[0].innerHTML = ` ${generateRngResult(pmCommand, data.msg, data.date)} <span style="background:#4A4; color: #FFF;"> &#9745; </span>`;
		nameQuery[0].innerHTML = `${user.props.name}`;
	}
	else if (pmCommand === 'me') {
		nameQuery[0].innerHTML = `${user.props.name} `;
	}
	else {
		nameQuery.html(`&nbsp;${user.props.name}:&nbsp;`);
	}

	nameQuery.attr('style', `color: #${user.props.color[0]}`);
	if (pmSettings.colorText) {
		msgQuery.attr('style', `color: #${user.props.color[0]}`);
	}
}

function setPmAway() {
	let userId = $('#pmNamesDroplist option:selected').val();
	let name = $("#pmNamesDroplist option:selected").html();
	if (!awayMessages[userId]) {
		let awayMsgObj = {
			"usedPmAwayMsg": false,
			"message": "",
			"enabled": false
		}
		awayMessages[userId] = awayMsgObj;
	}

	if (!awayMessages[userId].enabled) {
		$("#pmNamesDroplist option:selected").html("[Away]" + name);
	}
	awayMessages[userId].enabled = true;
	awayMessages[userId].message = $('input#awayMessageTextbox').val();
	$("#pmNamesDroplist option:selected").css("background-color", "#FFD800");
	$("#pmNamesDroplist option:selected").prop("selected", false);
}

function removePmAway() {
	const userId = $('#pmNamesDroplist option:selected').val();
	if (!awayMessages[userId]) { return; }
	let name = $("#pmNamesDroplist option:selected").html();
	if (awayMessages[userId].enabled && name.startsWith('[Away]')) {
		awayMessages[userId].enabled = false;
		$("#pmNamesDroplist option:selected").html(name.substring(6, name.length));
		$("#pmNamesDroplist option:selected").css("background-color", "");
		$('input#awayMessageTextbox').val("");
	}
}

function saveSetting(ev) {
	const targetWidget = $(ev.target);
	const dataName = targetWidget.attr('dataName');

	if(dataName.length === 0) { return; }

	if (targetWidget.attr('type') === 'checkbox') {
		pmSettings[dataName] = targetWidget.is(':checked');
	}
	else if (targetWidget.attr('type') === 'text') {
		pmSettings[dataName] = targetWidget.val();
	}

	settingsModule.saveSettings(localStorageName, pmSettings);
}

function loadSettings() {
	let storedSettings = settingsModule.getSettings(localStorageName)
	pmSettings = {
		'colorText': false,
		'notify': false,
		'audioUrl': 'https://www.rphaven.com/sounds/imsound.mp3',
		'sideTabs': false,
	}

	if (storedSettings) {
		pmSettings = Object.assign(pmSettings, storedSettings)
	} 

	$('#pmColorEnable').prop("checked", pmSettings.colorText)
	$('#pmSideTabsEnable').prop("checked", pmSettings.sideTabs)
	$('#pmNotify').prop("checked", pmSettings.notify)
	$('#pmPingURL').val(pmSettings.audioUrl)
	rph.sounds.im = new Audio(pmSettings.audioUrl)

	if(pmSettings.sideTabs === true) {
		let pmTabs = $('div.ul-rows').detach();
		$('head').append(`<style>ul.pm-tabs li.tab{display: block; width: auto;}</style>`)
		$('#pm-dialog').css('display', 'flex');
		$('#pm-dialog > div')[0].id = "pm-content";
		$('#pm-content').css('width', '75%');
		$('#pm-dialog').append(`<div id="pm-tabs" style="width: 25%; background: #303235; overflow: auto"></div>`);
		$('#pm-tabs').append(pmTabs);
	}
}

return {
	init: init,
	loadSettings: loadSettings,
	getHtml: html,
	moduleName: 'pm'
}
}());
