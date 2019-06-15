/**
 * Handles importing, exporting, and deleting of settings.
 */
var settingsModule = (function () {
    var html = {
        'tabId': 'settings-module',
        'tabName': 'Settings',
        'tabContents': '<h3>Script Settings</h3>' +
            '<p>Press "Export" to export savable settings.</p>' +
            '<p>To import settings, paste them into the text box and press "Import".</p><br />' +
            '<textarea name="importExportText" id="importExportTextarea" rows=10 class="rpht_textarea" ></textarea>' +
            '<br /><br />' +
            '<button type="button" style="width: 60px;" id="exportButton">Export</button>' +
            '<button type="button" style="margin-left: 10px; width: 60px;" id="importButton">Import</button>' +
            '<button type="button" style="margin-left: 394px; "id="deleteSettingsButton">Delete settings</button>'
    };

    var confirmDelete = false;

    var deleteTimer = null;

    /** 
     * Initializes the GUI components of the module.
     */
    function init() {
        $('#importButton').click(function () {
            importSettingsHanlder();
        });

        $('#exportButton').click(function () {
            $('textarea#importExportTextarea').val(exportSettings());
        });

        $('#printSettingsButton').click(function () {
            printSettings();
        });

        $('#deleteSettingsButton').click(function () {
            deleteSettingsHanlder();
        });
    }

    /**
     * Handles the initial portion of importing settings. This checks the input
     * to see if it's a valid JSON formatted string.
     */
    function importSettingsHanlder() {
        try {
            var newSettings = JSON.parse($('textarea#importExportTextarea').val());
            localStorage.setItem(SETTINGS_NAME, JSON.stringify(newSettings));
            rphToolsModule.getAllModules().forEach((module) => {
                if (module.loadSettings){
                    module.loadSettings();
                }
            });
        }
        catch {
            console.log('[RPHT.Settings]: There was a problem with importing settings');
            markProblem('textarea#importExportTextarea', true)
        }
    }

    /**
     * Exports settings into a JSON formatted string
     */
    function exportSettings() {
        return localStorage.getItem(SETTINGS_NAME);
    }

    /** 
     * Logic to confirm deleting settings. The button needs to be pressed twice
     * within 10 seconds for the settings to be deleted.
     */
    function deleteSettingsHanlder() {
        if (confirmDelete === false) {
            $('#deleteSettingsButton').text('Press again to delete');
            confirmDelete = true;

            /* Set a timeout to make "confirmDelete" false automatically */
            deleteTimer = setTimeout(function () {
                confirmDelete = false;
                $('#deleteSettingsButton').text('Delete Settings');
            }, 10 * 1000);
        } else if (confirmDelete === true) {
            clearTimeout(deleteTimer);
            console.log('RPH Tools[Settings Module]: Deleting settings');
            $('#deleteSettingsButton').text('Delete Settings');
            confirmDelete = false;
            localStorage.removeItem(SETTINGS_NAME);
            localStorage.setItem(SETTINGS_NAME, JSON.stringify({}));
            rphToolsModule.getAllModules().forEach((module) => {
                if (module.loadSettings){
                    console.log("Reloading", module.toString());
                    module.loadSettings();
                }
            });
        }
    }

    function saveSettings(moduleName, moduleSettings) {
        var settings = JSON.parse(localStorage.getItem(SETTINGS_NAME));
        settings[moduleName] = {};
        settings[moduleName] = moduleSettings;
        localStorage.setItem(SETTINGS_NAME, JSON.stringify(settings));
    }

    function getSettings(moduleName) {
        var settings = JSON.parse(localStorage.getItem(SETTINGS_NAME));
        var moduleSettings = null;
        if (settings[moduleName]) {
            moduleSettings = settings[moduleName];
        }
        return moduleSettings;
    }

    function getHtml() {
        return html;
    }

    function toString() {
        return 'Settings Module';
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
    };
}());