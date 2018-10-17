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
    var init = function () {
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
    var importSettingsHanlder = function () {
        settings = $('textarea#importExportTextarea').val().split("\n");
        for (var i = 0; i < settings.length - 1; i++) {
            try {
                var settingsObj = JSON.parse(settings[i]);
                console.log('RPHT [Setting Module]: Importing...', settingsObj);
                importSettings(settingsObj);
            } catch (err) {
                console.log('RPH Tools[importSettings]: Error importing settings', err);
                markProblem("importExportTextarea", true);
            }
        }
    }
    /**
     * Takes the object from the JSON formatted string and imports it into the
     * relevant modules
     * @param {Object} settingsObj 
     */
    var importSettings = function (settingsObj) {
        var module = rphToolsModule.getModule(settingsObj.name);
        if (!module) {
            return;
        } else if (!module.loadSettings) {
            return;
        }
        module.loadSettings(settingsObj.settings);
    };

    /**
     * Exports settings into a JSON formatted string
     */
    var exportSettings = function () {
        var settingsString = "";
        var modules = rphToolsModule.getModules();
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].getSettings !== undefined) {
                var modSettings = {
                    name: modules[i].toString(),
                    settings: modules[i].getSettings(),
                };
                settingsString += JSON.stringify(modSettings) + "\n";
            }
        }
        return settingsString;
    };

    /** 
     * Logic to confirm deleting settings. The button needs to be pressed twice
     * within 10 seconds for the settings to be deleted.
     */
    var deleteSettingsHanlder = function () {
        if (confirmDelete === false) {
            $('#deleteSettingsButton').text('Press again to delete');
            confirmDelete = true;

            // Set a timeout to make "confirmDelete" false automatically
            deleteTimer = setTimeout(function () {
                confirmDelete = false;
                $('#deleteSettingsButton').text('Delete Settings');
            }, 10 * 1000);
        } else if (confirmDelete === true) {
            console.log('RPH Tools[Settings Module]: Deleting settings');
            $('#deleteSettingsButton').text('Delete Settings');
            confirmDelete = false;
            deleteAllSettings();
            clearTimeout(deleteTimer);
        }
    };

    /** 
     * Deletes all of the settings of the modules that have settings.
     */
    var deleteAllSettings = function () {
        var modules = rphToolsModule.getModules();
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].deleteSettings) {
                modules[i].deleteSettings();
            }
        }
    };

    /** 
     * Public members of the module
     */
    return {
        init: init,

        getHtml: function () {
            return html;
        },

        toString: function () {
            return 'Settings Module';
        },
    };
}());