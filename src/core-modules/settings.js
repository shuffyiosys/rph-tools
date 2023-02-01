let settingsModule = (function () {
let html = {
	tabId: 'settings-module',
	tabName: 'Settings',
	tabContents: `
		<h4>Script Settings</h4><br>
		<h5>Import/Export settings</h5>
		<div class="rpht-option-block">
			<div class="rpht-option-section">
				<label class="rpht-label split-input-label">Export settings to a JSON text file</label>
				<a class="split-input-label" id="downloadSettingsLink" download="settings.txt">Download settings</a>
			</div>
			<div class="rpht-option-section">
				<label class="rpht-label split-input-label">Import settings from a JSON text file</label>
				<input class="split-input-label" id="importFileInput" type="file" /> <button style="display: none;" id="retryImportButton">Retry</button>
				<p id="importSettingsStatus"></p>
			</div>
			<div class="rpht-option-section option-section-bottom">
				<label class="rpht-label checkbox-label">Import/export settings from text</label>
				<textarea name="importExportText" id="importExportTextarea" rows=10 class="rpht_textarea"></textarea>
				<br /><br />
				<button type="button" style="width: 60px;" id="exportButton">Export</button>
				<button type="button" style="margin-left: 10px; width: 60px;" id="importButton">Import</button>
				<button type="button" style="float: right; background: red;" id="deleteSettingsButton">Delete settings</button>
			</div>
		</div>`
}

let confirmDelete = false;
let deleteTimer = null;

function init() {
	if (!localStorage.getItem(SETTINGS_NAME)){
		localStorage.setItem(SETTINGS_NAME, JSON.stringify({}))
	}

	$('#importButton').click(() => {
		let importSuccess = importSettingsFromText($('textarea#importExportTextarea').val());
		markProblem('textarea#importExportTextarea', importSuccess);
	})

	$('#exportButton').click(() => {
		$('textarea#importExportTextarea').val(exportSettings());
	})

	$('#downloadSettingsLink').click(() => {
		let settings = JSON.parse(localStorage.getItem(SETTINGS_NAME));
		delete settings.chatLogs;
		
		const settingsText = makeTextFile(JSON.stringify(settings, null, 4));
		$('#downloadSettingsLink').attr('href', settingsText);
		$('#downloadSettingsLink').attr('download', `rph-tools-settings.json`);
	})

	$('#importFileInput').change(() => {
		let file = $("#importFileInput")[0].files[0];
		(async () => {
			let fileContent = await file.text();
			let successfulImport = importSettingsFromText(fileContent);
			const statusText = (successfulImport) ? 'Import successful' : 'There was a problem with the import';
			$('#importSettingsStatus').first().text(statusText);
		})();
	})


	$('#printSettingsButton').click(() => {
		printSettings();
	})

	$('#deleteSettingsButton').click(() => {
		deleteSettingsHanlder();
	})
}

function importSettingsFromText(jsonText) {
	let successfulImport = false;
	try {
		let newSettings = JSON.parse(jsonText)
		localStorage.setItem(SETTINGS_NAME, JSON.stringify(newSettings))
		rphToolsModule.getAllModules().forEach((module) => {
			if (module.loadSettings) { module.loadSettings(); }
		})
		successfulImport = true
	}
	catch {
		console.log('[RPHT.Settings]: There was a problem with importing settings')
	}
	return successfulImport
}

function exportSettings() {
	const settings = JSON.parse(localStorage.getItem(SETTINGS_NAME));
	delete settings.chatLogs;
	markProblem('textarea#importExportTextarea', false);
	return JSON.stringify(settings, '\n', 4);
}

function deleteSettingsHanlder() {
	if (confirmDelete === false) {
		const CONFIRM_TIMEOUT_MS = 10000;
		$('#deleteSettingsButton').text('Press again to delete');
		confirmDelete = true;
		deleteTimer = setTimeout(() => {
			confirmDelete = false;
			$('#deleteSettingsButton').text('Delete Settings');
		}, CONFIRM_TIMEOUT_MS);
	} else if (confirmDelete === true) {
		console.log('RPH Tools[Settings Module]: Deleting settings');
		$('#deleteSettingsButton').text('Delete Settings');

		clearTimeout(deleteTimer);
		confirmDelete = false;
		localStorage.removeItem(SETTINGS_NAME);
		localStorage.setItem(SETTINGS_NAME, JSON.stringify({}))
		rphToolsModule.getAllModules().forEach((module) => {
			module.loadSettings();
		});
	}
}

function makeTextFile (text) {
	const data = new Blob([text], {type: 'text/plain'});
	let textFile = null;

	// Revoke the object URL to avoid memory leaks
	if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
	}
	textFile = window.URL.createObjectURL(data);
	return textFile;
};

function saveSettings(moduleName, moduleSettings) {
	let settings = JSON.parse(localStorage.getItem(SETTINGS_NAME));
	settings[moduleName] = {};
	settings[moduleName] = moduleSettings;
	localStorage.setItem(SETTINGS_NAME, JSON.stringify(settings));
}

function getSettings(moduleName) {
	let settings = JSON.parse(localStorage.getItem(SETTINGS_NAME))
	let moduleSettings = (settings[moduleName]) ? settings[moduleName] : null;
	return moduleSettings
}

return {
	init: init,
	saveSettings: saveSettings,
	getSettings: getSettings,
	getHtml: html,
	moduleName: 'settings'
}
}());
