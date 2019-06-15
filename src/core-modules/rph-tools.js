/**
 * Main RPH Tools module
 */
var rphToolsModule = (function () {
    var modules = [];

    var rpht_css =
        '<style>' +
        '.rpht_labels{display: inline-block; width: 300px; text-align: right; margin-right: 10px;}' +
        '.rpht_textarea{border: 1px solid black; width: 611px;}' +
        '.rpht_chat_tab {' +
        'position: absolute;' +
        'height: 54px;' +
        'overflow-x: auto;' +
        'overflow-y: hidden;' +
        'white-space: nowrap;' +
        '}' +
        '</style>';

    /**
     * Initializes the modules and the HTML elements it handles.
     * @param {Array} addonModules Modules to add into the system.
     */
    function init (addonModules) {
        var $settingsDialog = $('#settings-dialog')
        modules = addonModules;

        $('head').append(rpht_css);
        $('#settings-dialog .inner ul.tabs').append('<h3>RPH Tools</h3>')
        
        /* Checks to see if there's a local store for settings and creates one
         * if there isn't. */
        var settings = localStorage.getItem(SETTINGS_NAME);
        if (!settings) {
            settings = {};
            localStorage.setItem(SETTINGS_NAME, JSON.stringify(settings));
        }

        modules.forEach(function (module) {
            if (module.getHtml) {
                html = module.getHtml();
                $('#settings-dialog .inner ul.tabs')
                    .append('<li><a href="#' + html.tabId + '">' + html.tabName +
                        '</a></li>');
                $('#settings-dialog .inner div.content div.inner')
                    .append('<div id="' + html.tabId + '" style="display: none;">' +
                        html.tabContents + '</div>')

                $settingsDialog.find('.tabs a[href="#' + html.tabId + '"]').click(
                    function (ev) {
                        $settingsDialog.find('.content .inner > div').hide();
                        $settingsDialog.find($(this).attr('href')).show();
                        ev.preventDefault();
                    });

                module.init();
            }
        });
    }

    /**
     * Returns a module based on a name passed in.
     * @param {string} name Name of the module to get the data
     * @returns Returns the module, if found. Otherwise returns null.
     */
    var getModule = function (name) {
        var module = null;
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].toString() === name) {
                module = modules[i];
                break;
            }
        }
        return module;
    };

    function getAllModules() {
        return modules;
    }

    function getHtml() {
        return html;
    }

    function toString() {
        return 'RPH Tools Module';
    }

    return {
        init: init,
        getModule: getModule,
        getAllModules: getAllModules,
        getHtml: getHtml,
        toString: toString,
    };
}());