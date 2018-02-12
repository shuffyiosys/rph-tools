/******************************************************************************
 * This module handles the importing and exporting of settings in RPH Tools.
 *****************************************************************************/
var settingsModule = (function () {
  var html = {
    'tabId': 'settings-module',
    'tabName': 'Settings',
    'tabContents': '<h3>Script Settings</h3>' +
      '<p>Press "Export" to export savable settings.</p>' +
      '<p>To import settings, paste them into the text box and press "Import".</p><br />' +
      '<textarea name="importExportText" id="importExportTextarea" rows=10 class="rpht_textarea" ></textarea>' +
      '<br /><br />' +
      '<button type="button" style="margin-right: 144px;" id="exportButton">Export</button>' +
      '<button type="button" style="margin-right: 134px;" id="importButton">Import</button>' +
      '<button type="button" id="deleteSettingsButton">Delete settings</button>'
  };

  var confirmDelete = false;

  var deleteTimer = null;

  /****************************************************************************
   * Initializes the modules and the HTML elements it handles.
   ***************************************************************************/
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

  /****************************************************************************
   * @brief:    Prints out the settings into the main textbox for exporting.
   ****************************************************************************/
  var importSettingsHanlder = function(){
    settings = $('textarea#importExportTextarea').val().split("|");
      try {
        for (var i = 0; i < settings.length - 1; i++) {
          var settingsJson = JSON.parse(settings[i]);
          console.log('RPHT [Setting Module]: Importing...', settingsJson);
          importSettings(settingsJson);
        }
      } catch (err) {
        console.log('RPH Tools[importSettings]: Error importing settings', err);
        markProblem("importExportTextarea", true);
      }
  }

  var importSettings = function (settingsJson) {
    var module = rphToolsModule.getModule(settingsJson.name);

    if (!module) {
      return;
    } else if (!module.loadSettings) {
      return;
    }
    module.loadSettings(settingsJson.settings);
  };

  var exportSettings = function () {
    var settingsString = "";
    var modules = rphToolsModule.getSettings();
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].getSettings !== undefined) {
        var modSettings = {
          name: modules[i].toString(),
          settings: modules[i].getSettings(),
        };
        settingsString += JSON.stringify(modSettings) + "|";
      }
    }
    return settingsString;
  };

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

  var deleteAllSettings = function () {
    var modules = rphToolsModule.getSettings();
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].deleteSettings) {
        modules[i].deleteSettings();
      }
    }
  };

  var printSettings = function () {
    var modules = rphToolsModule.getSettings();
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].getSettings !== undefined) {
        console.log(modules[i].getSettings());
      }
    }
    return settingsString;
  };

  /****************************************************************************
   * Public members of the module
   ***************************************************************************/
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
