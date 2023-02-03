let logManagerModule = (function () {
const INDEXED_DB_VERS = 20;
const spacingStyle = `width: 240px;`;
const logContentStyle = `border:#888 solid 1px;border-radius:10px padding-bottom:12px;margin-bottom:12px; width: 100%; height: 720px; overflow: auto;`;
let html = {
	tabId: `log-manager`,
	tabName: `Log Manager`,
	tabContents: `
		<h4>Log Manager</h4><br />
		<h5>Log Importer</h5><br />
		<div class="rpht-option-block">
			<label class="rpht-label" for="logFileInput">Import Log</label>
			<input id="logFileInput" type="file" /> <button style="display: none;" id="retryImportButton">Retry</button><br /><br />
			<p id="importStatus"></p>
		</div>
		<h5>Log Exporter</h5><br />
		<div class="rpht-option-block">
			<div class="rpht-option-section">
				<label class="rpht-label" for="startDateInput">Start Date</label>
				<input type="date" id="startDateInput" style="float: right;" name="startDate">
			</div>
			<div class="rpht-option-section">
				<label class="rpht-label" for="endDateInput">End Date</label>
				<input type="date" id="endDateInput" style="float: right;" name="endDate">
			</div>
			<div class="rpht-option-section option-section-bottom">
				<label class="rpht-label checkbox-label" for="reverseNamesInput">Select by your name first</label>
				<label class="switch"><input type="checkbox" id="reverseNamesInput"><span class="rpht-slider round"></span></label>
			</div>
			<p style="line-height: 2em;">
				<label class="rpht-label" style="${spacingStyle}"></label>
				<button id="getLogsButton">Get logs</button>
			</p>
		</div>
		<div id="logEntriesContainer" style="display: none">
			<p><strong>Log Management</strong></p><br />
			<div id="downloadLinks" class="rpht-option-block">
				<div class="rpht-option-section">
					<p>Download:
						<a id="downloadPlainTextLink">Download log as plaintext</a> | 
						<a id="downloadJsonLink">Export log for importing</a> |
						<a id="downloadAllLink">Download all logs</a>
					</p>
				</div>
				<div class="rpht-option-section option-section-bottom">
					<p>
						Delete:
						<button id="deleteButton" style="background:red">Delete this log</button> |
						<button id="deleteFromNameButton" style="background:red">Delete logs from...</button>
					</p>
				</div>
			</div>
			</div>
			<hr style="margin-top: 20px;" />
			<p><strong>View log</strong></p><br />
			<label id="logFirstName" class="rpht-label" style="${spacingStyle}">Others name </label><select
				style="${spacingStyle}" id="nameOneDropList"></select>
			<a id="yourProfileLink" style="margin-left: 10px; display: none;" target="_blank">See
				profile</a><br /><br />
			<label id="logSecondName" class="rpht-label" style="${spacingStyle}">Your name </label><select
				style="${spacingStyle}" id="nameTwoDropList"></select>
			<a id="otherProfileLink" style="margin-left: 10px; display: none;" target="_blank">See
				profile</a><br /><br />
			<div style="${logContentStyle}" id="log-contents"></div>
		</div>
		</div>`
}

let request = null;
let logDb = null;
let fileContent = null;
let logDbDump = {};
let logEntryDump = {};
let logEntries = {};
let idsToNames = {};
let deleteTimer = null;
let byUsername = false;

function init() {
	$('#logFileInput').change(handleFileInput);
	$('#retryImportButton').click(() => {
		$('#retryImportButton').hide();
		loadLogFile(fileContent);
	})

	$('#getLogsButton').click(getLogs);
	$('#nameOneDropList').change(updateDropdownLists);
	$('#nameTwoDropList').change(() => {
		const otherName = $('#nameTwoDropList option:selected').val()
		$('#otherProfileLink').attr('href', `https://profiles.rphaven.com/${otherName}`)
		fillInLogContents();
	});
	$('#deleteButton').click(() => {
		handleDelete('#deleteButton', 'Delete logs from...', deleteLog);
	})
	$('#deleteFromNameButton').click(() => {
		handleDelete('#deleteFromNameButton', 'Delete this log', deleteLogsByName);
	})

	socket.on('account-users', createLogDatabase);
}

/** UI related functions *****************************************************/
function handleFileInput() {
	let file = $("#logFileInput")[0].files[0];
	(async () => {
		fileContent = await file.text();
		loadLogFile(fileContent);
	})();
}

function handleDelete(elementId, defaultText, deleteFunction) {
	if (typeof(deleteFunction) !== 'function') { return; }

	if (deleteTimer === null) {
		$(elementId).html('Press again to delete...');
		deleteTimer = setTimeout(() => {
			deleteTimer = null;
			$(elementId).html(defaultText);
		}, 5000);
	}
	else {
		deleteFunction().then(() => {return 1;});
		clearTimeout(deleteTimer);
		deleteTimer = null;
	}
}

function fillInLogContents() {
	const username = $('#nameOneDropList option:selected').val()
	const otherName = $('#nameTwoDropList option:selected').val()
	const entry = logEntries[username][otherName]

	$('#log-contents').empty();
	for (let timestamp in entry) {
		$('#log-contents').append(`<p>${createTimestamp(parseInt(timestamp))} ${entry[timestamp].author}: ${entry[timestamp].msg}</p>`)
		logEntryDump[entry[timestamp].dBkey] = logDbDump[entry[timestamp].dBkey]
	}

	$('#downloadPlainTextLink').attr('href', makeTextFile($('#log-contents').html().replace(/<p>/g, '').replace(/<\/p>/g, '\n')));
	$('#downloadPlainTextLink').attr('download', `${username}-${otherName}-log.txt`);

	$('#downloadJsonLink').attr('href', makeTextFile(JSON.stringify(logEntryDump, null, 4)));
	$('#downloadJsonLink').attr('download', `${username}-${otherName}-log.json`);
	$('#deleteFromNameButton').text(`Delete logs from ${username}`);
}

function updateDropdownLists() {
	const username = $('#nameOneDropList option:selected').val();
	const otherNames = Object.keys(logEntries[username]).sort();
	$('#nameTwoDropList').empty();

	otherNames.forEach((name) => {addToDroplist(name, name, "#nameTwoDropList")});

	const otherName = $('#nameTwoDropList option:selected').val();
	$('#yourProfileLink').attr('href', `https://profiles.rphaven.com/${username}`);
	$('#otherProfileLink').attr('href', `https://profiles.rphaven.com/${otherName}`);
	$('#yourProfileLink').show();
	$('#otherProfileLink').show();
	fillInLogContents();
}

function refreshNameDropLists() {
	$('#nameOneDropList').empty();
	const names = Object.keys(logEntries).sort();
	names.forEach(name => {addToDroplist(name, name, '#nameOneDropList')});
	updateDropdownLists();
}

function addToDroplist(value, label, droplist) {
	let droplist_elem = $(droplist)
	droplist_elem.append($('<option>', {
		value: value,
		text: label
	}));
}

const toggleableElements = [
	'#getLogsButton',
	'#reverseNamesInput',
	'#nameOneDropList',
	'#nameTwoDropList',
	'#deleteButton',
	'#deleteFromNameButton'
]

function disableControls() {
	toggleableElements.forEach(element => {
		$(element).prop("disabled", true);
	});

	$('#downloadPlainTextLink').removeAttr('href download');
	$('#downloadJsonLink').removeAttr('href download');
	$('#downloadAllLink').removeAttr('href download');
}

function enableControls() {
	toggleableElements.forEach(element => {
		$(element).prop("disabled", false);
	});
}

/* Functions related to database manipulation ********************************/
function createLogDatabase() {
	// If this database was not created, create it.
	request = indexedDB.open(`${account.props.accid}`, INDEXED_DB_VERS)
	request.onupgradeneeded = function(event) {
		logDb = event.target.result
		logDb.onerror = function(event) {
			console.log(event)
		};
		let newObjectStore = logDb.createObjectStore("msgs", { keyPath: [
			["date", "fromid", "userid"],
			"userid",
			["userid", "otherid"],
			["fromid", "date"], "date"]
		});

		newObjectStore.transaction.oncomplete = () => {
			logDb.close()
		}
	}
}

function getLogs() {
	logEntries = {};
	logDbDump = {};
	idsToNames = {};
	byUsername = $('#reverseNamesInput').is(":checked");
	$('#log-contents').empty();
	$('#nameTwoDropList').empty();
	$('#nameOneDropList').empty();
	$('#logEntriesContainer').show();

	if (byUsername == true) {
		$(`label#logFirstName`).first().text("Your name");
		$(`label#logSecondName`).first().text("Other's name");
	}
	else {
		$(`label#logFirstName`).first().text("Other's name");
		$(`label#logSecondName`).first().text("Your name");
	}

	request = indexedDB.open(`${account.props.accid}`, INDEXED_DB_VERS);
	request.onsuccess = function(event) {
		logDb = event.target.result;
		logDb.transaction(['msgs']).objectStore('msgs').openCursor().onsuccess = processLogEntry;
	}
}

function processLogEntry(event) {
	const startTime = (isNaN($('#startDateInput')[0].valueAsNumber)) ? 0 : $('#startDateInput')[0].valueAsNumber;
	const endTime = (isNaN($('#endDateInput')[0].valueAsNumber)) ? Date.now() : $('#endDateInput')[0].valueAsNumber;
	let cursor = event.target.result;
	$('#getLogsButton').html("Getting logs...");
	disableControls();

	if (!cursor || (cursor && cursor.value.date > endTime)) {
		let link = $('#downloadAllLink');
		link.attr('href', makeTextFile(`${JSON.stringify(logDbDump, null, 4)}`));
		link.attr('download', `${account.props.accid}-all-logs.txt`);

		setTimeout(() => {
			$('#getLogsButton').html("Get logs");
			enableControls();
			refreshNameDropLists();
		}, 100)

		return;
	}
	let logEntry = cursor.value;
	let key = cursor.key.join();

	if ((Math.log(logEntry.date) * Math.LOG10E + 1 | 0) < 11) {
		logEntry.date *= 1000;
	}

	if (startTime > logEntry.date) {
		cursor.continue();
	}
	else {
		logDbDump[key] = cursor.value;

		if(	(logEntry.otherid in idsToNames) &&
			(logEntry.fromid in idsToNames) &&
			(logEntry.userid in idsToNames))
		{
			logEntry.other_name = idsToNames[logEntry.otherid];
			logEntry.from_name = idsToNames[logEntry.fromid];
			logEntry.user_name = idsToNames[logEntry.userid];
			addLogEntry(logEntry);
		}
		else {
			getUserById(logEntry.otherid)
			.then((user) =>{
				logEntry.other_name = user.props.name;
				idsToNames[user.props.id]  = user.props.name;
				return getUserById(logEntry.fromid);
			})
			.then((user) =>{
				logEntry.from_name = user.props.name;
				idsToNames[user.props.id] = user.props.name;
				return getUserById(logEntry.userid);
			})
			.then((user) =>{
				logEntry.user_name = user.props.name;
				idsToNames[user.props.id] = user.props.name;
				addLogEntry(logEntry, key);
				return Promise.resolve();
			})
		}

		cursor.continue();
	}
}

function addLogEntry(logEntry, key) {
	const username = ($('#reverseNamesInput').is(":checked")) ? logEntry.user_name : logEntry.other_name;
	const otherName = ($('#reverseNamesInput').is(":checked")) ? logEntry.other_name : logEntry.user_name;

	if (username in logEntries === false) {
		logEntries[username] = {};

		/* Sort names as they come in */
		let options = $('#nameOneDropList option');
		let arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();
		arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
		options.each(function(i, o) {
			o.value = arr[i].v;
			$(o).text(arr[i].t);
		});
	}
	if (otherName in logEntries[username] === false) {
		logEntries[username][otherName] = {};
	}

	logEntries[username][otherName][logEntry.date] = {
		author: logEntry.from_name,
		msg: logEntry.msg,
		dBkey: key
	}
}

function loadLogFile(jsonString) {
	$('#importStatus').text('Importing log...')
	try {
		request = indexedDB.open(`${account.props.accid}`, INDEXED_DB_VERS);
		request.onsuccess = function(event) {
			logDb = event.target.result
			processLogFile(JSON.parse(jsonString))
		};
	}
	catch (e) {
		$('#importStatus').text('Error importing log')
		$('#retryImportButton').show()
		console.log(e);
	}
}

function processLogFile(jsonBlob) {
	let tx = logDb.transaction("msgs", 'readwrite')
	let store = tx.objectStore("msgs")
	for(let key in jsonBlob) {
		let keypath = key.split(',')
		for(let i = 0; i < 3; i ++) {
			keypath[i] = parseInt(keypath[i])
		}

		store.put({
			id: key,
			date: jsonBlob[key].date,
			fromid: jsonBlob[key].fromid,
			userid: jsonBlob[key].userid,
			otherid: jsonBlob[key].otherid,
			msg: jsonBlob[key].msg
		})
	}

	/* Remove the ID key in each log to conform with how RPH stores logs */
	tx = logDb.transaction('msgs', 'readwrite')
	store = tx.objectStore('msgs').openCursor(null, 'prev').onsuccess = function(event) {
		var cursor = event.target.result
		if (cursor && ("id" in cursor.value)) {
			delete cursor.value.id;
			cursor.update(cursor.value);
			cursor.continue()
		}
	}

	tx.oncomplete = () => {
		$('#importStatus').text('Importing done!')
	};
}

async function deleteLog() {
	let otherUser = await getUserByName($('#nameOneDropList option:selected').val());
	let acctUser = await getUserByName($('#nameTwoDropList option:selected').val());

	if (byUsername == true) {
		acctUser = await getUserByName($('#nameOneDropList option:selected').val());
		otherUser = await getUserByName($('#nameTwoDropList option:selected').val());
	}

	$('#deleteButton').html("Deleting logs...");
	disableControls();

	let tx = logDb.transaction('msgs', 'readwrite');
	let store = tx.objectStore('msgs').openCursor(null, 'prev').onsuccess = function(event) {
		var cursor = event.target.result;
		if (!cursor) {
			let primaryKey = (byUsername === true) ? acctUser.props.name : otherUser.props.name;
			let secondaryKey = (byUsername === true) ? otherUser.props.name : acctUser.props.name;
			delete logEntries[primaryKey][secondaryKey];
			if (Object.keys(logEntries[primaryKey]).length === 0) {
				delete logEntries[primaryKey];
			}
			refreshNameDropLists();
			enableControls();
			$('#deleteButton').html("Delete this log");

			if (primaryKey in logEntries) {
				$(`#nameOneDropList option[value=${primaryKey}]`).prop('selected', true);
				updateDropdownLists();
			}
			return
		}
		else if (cursor.value.userid == acctUser.props.id && cursor.value.otherid == otherUser.props.id) {
			cursor.delete();
		}
		cursor.continue();
	}
}

async function deleteLogsByName() {
	let userData = await getUserByName($('#nameOneDropList option:selected').val())

	$('#deleteFromNameButton').html("Deleting logs...");
	disableControls()

	let tx = logDb.transaction('msgs', 'readwrite')
	let store = tx.objectStore('msgs').openCursor(null, 'prev').onsuccess = function(event) {
		var cursor = event.target.result
		if (!cursor) {
			$('#deleteFromNameButton').html("Delete logs from this name");
			delete logEntries[userData.props.name];
			enableControls()
			refreshNameDropLists();
			return;
		}
		else if (cursor.value.otherid == userData.props.id) {
			cursor.delete()
		}
		cursor.continue()
	}
}

/** Utility functions ********************************************************/
function createTimestamp(time) {
	const timestamp = new Date(time);
	const dateString = timestamp.toLocaleDateString(navigator.language);
	const timeString = timestamp.toTimeString().substring(0,5);
	return `${dateString} ${timeString}`;
}

function makeTextFile (text) {
	let textFile = null;
	let data = new Blob([text], {type: 'text/plain'});

	// If we are replacing a previously generated file we need to
	// manually revoke the object URL to avoid memory leaks.
	if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
	}

	textFile = window.URL.createObjectURL(data);

	return textFile;
};

	return {
		init: init,
		loadSettings: () => { return;},
		getHtml: html,
		moduleName: `logManager`,
	}
}());
