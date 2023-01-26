/**
 * Handles importing, exporting, and deleting of settings.
 */
let settingsModule = (function () {
	let html = {
		'tabId': 'settings-module',
		'tabName': 'Settings',
		'tabContents': '<h3>Script Settings</h3><br>' +
			'<h4>Import/Export settings</h4>' +
			'<div class="rpht-option-block">' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label split-input-label">Export settings to a JSON text file</label>' +
			`		<a class="split-input-label" id="downloadSettingsLink" download="settings.txt">Download settings</a>` +
			'	</div>' +
			'	<div class="rpht-option-section">' +
			'		<label class="rpht-label split-input-label">Import settings from a JSON text file</label>' +
			'		<input class="split-input-label" id="importFileInput" type="file" /> <button style="display: none;" id="retryImportButton">Retry</button>' +
			'		<p id="importSettingsStatus"></p>' +
			'	</div>' +
			'	<div class="rpht-option-section option-section-bottom">' +
			'		<label class="rpht-label checkbox-label">Import/export settings from text</label>' +
			'		<textarea name="importExportText" id="importExportTextarea" rows=10 class="rpht_textarea"></textarea>' +
			'		<br /><br />' +
			'		<button type="button" style="width: 60px;" id="exportButton">Export</button>' +
			'		<button type="button" style="margin-left: 10px; width: 60px;" id="importButton">Import</button>' +
			'		<button type="button" style="float: right; background: red;" id="deleteSettingsButton">Delete settings</button>' +
			'	</div>' +
			'</div>'
	}

	let confirmDelete = false

	let deleteTimer = null

	/** 
	 * Initializes the GUI components of the module.
	 */
	function init() {
		if (!localStorage.getItem(SETTINGS_NAME)){
			localStorage.setItem(SETTINGS_NAME, JSON.stringify({}))
		}

		$('#importButton').click(() => {
			let importSuccess = importSettingsHanlder($('textarea#importExportTextarea').val())
			if (importSuccess) {
				markProblem('textarea#importExportTextarea', false)
			}
			else {
				markProblem('textarea#importExportTextarea', true)
			}
		})

		$('#exportButton').click(() => {
			$('textarea#importExportTextarea').val(exportSettings())
		})

		$('#downloadSettingsLink').click(() => {
			let link = document.getElementById('downloadSettingsLink');
			link.href =  makeTextFile(localStorage.getItem(SETTINGS_NAME))
			$('#downloadSettingsLink').attr('download', `rph-tools-settings.txt`)
		})

		$('#importFileInput').change(() => {
			let file = $("#importFileInput")[0].files[0];
			(async () => {
				fileContent = await file.text();
				let successfulImport = importSettingsHanlder(fileContent)

				if (successfulImport === false) {
					$('#importSettingsStatus').first().text('There was a problem with the import')	
				}
				else {
					$('#importSettingsStatus').first().text('Import successful')
				}
			})();
		})
	

		$('#printSettingsButton').click(() => {
			printSettings()
		})

		$('#deleteSettingsButton').click(() => {
			deleteSettingsHanlder()
		})
	}

	/**
	 * Handles the initial portion of importing settings. This checks the input
	 * to see if it's a valid JSON formatted string.
	 */
	function importSettingsHanlder(jsonText) {
		let successfulImport = false
		try {
			let newSettings = JSON.parse(jsonText)
			localStorage.setItem(SETTINGS_NAME, JSON.stringify(newSettings))
			rphToolsModule.getAllModules().forEach((module) => {
				if (module.loadSettings){
					module.loadSettings()
				}
			})
			successfulImport = true
		}
		catch {
			console.log('[RPHT.Settings]: There was a problem with importing settings')
		}
		return successfulImport
	}

	/**
	 * Exports settings into a JSON formatted string
	 */
	function exportSettings() {
		const settings = JSON.parse(localStorage.getItem(SETTINGS_NAME));
		delete settings.chatLogs;
		markProblem('textarea#importExportTextarea', false);
		return JSON.stringify(settings, '\n', 4);
	}
	

	/** 
	 * Logic to confirm deleting settings. The button needs to be pressed twice
	 * within 10 seconds for the settings to be deleted.
	 */
	function deleteSettingsHanlder() {
		if (confirmDelete === false) {
			$('#deleteSettingsButton').text('Press again to delete')
			confirmDelete = true

			/* Set a timeout to make "confirmDelete" false automatically */
			deleteTimer = setTimeout(() => {
				confirmDelete = false
				$('#deleteSettingsButton').text('Delete Settings')
			}, 10 * 1000)
		} else if (confirmDelete === true) {
			clearTimeout(deleteTimer)
			console.log('RPH Tools[Settings Module]: Deleting settings')
			$('#deleteSettingsButton').text('Delete Settings')
			confirmDelete = false
			localStorage.removeItem(SETTINGS_NAME)
			localStorage.setItem(SETTINGS_NAME, JSON.stringify({}))
			rphToolsModule.getAllModules().forEach((module) => {
				if (module.loadSettings){
					console.log(`RPH Tools[Settings Module]: ${module.toString()}`)
					module.loadSettings()
				}
			})
		}
	}

	function makeTextFile (text) {
		let textFile = null
		let data = new Blob([text], {type: 'text/plain'});
	
		// If we are replacing a previously generated file we need to
		// manually revoke the object URL to avoid memory leaks.
		if (textFile !== null) {
			window.URL.revokeObjectURL(textFile);
		}
	
		textFile = window.URL.createObjectURL(data);
	
		return textFile;
	};

	function saveSettings(moduleName, moduleSettings) {
		let settings = JSON.parse(localStorage.getItem(SETTINGS_NAME))
		settings[moduleName] = {}
		settings[moduleName] = moduleSettings
		localStorage.setItem(SETTINGS_NAME, JSON.stringify(settings))
	}

	function getSettings(moduleName) {
		let settings = JSON.parse(localStorage.getItem(SETTINGS_NAME))
		let moduleSettings = null
		if (settings[moduleName]) {
			moduleSettings = settings[moduleName]
		}
		return moduleSettings
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'Settings Module'
	}

	/** 
	 * Public members of the module
	 */
	return {
		init: init,
		saveSettings: saveSettings,
		getSettings: getSettings,
		getHtml: getHtml,
		toString: toString
	}
}());