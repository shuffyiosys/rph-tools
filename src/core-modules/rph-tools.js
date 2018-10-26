/**
 * Main RPH Tools module
 */
var rphToolsModule = (function () {
    var namesToIds = {};

    var idsToNames = {};

    var modules = [];

    var moduleDroplists = [];

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
    var init = function (addonModules) {
        var i;
        var $settingsDialog = $('#settings-dialog')
        modules = addonModules;

        $('head').append(rpht_css);
        $('#settings-dialog .inner ul.tabs').append('<h3>RPH Tools</h3>')

        modules.forEach(function (module, index) {
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
            }
        });

        /* When the account data receive event happens, delay some time before 
           initializing the modules because the relevant data isn't immediately
           available.  */
        socket.on('accounts', function () {
            console.log('RPH Tools[_on.accounts]: Account data blob received');
            setTimeout(function () {
                var moddingModule = getModule('Modding Module');
                account.users.forEach(function (userObj) {
                    if (moddingModule) {
                        moddingModule.findUserAsMod(userObj);
                    }
                    idsToNames[userObj.props.id] = userObj.props.name;
                    namesToIds[userObj.props.name] = userObj.props.id;
                });
                namesToIds = sortOnKeys(namesToIds);
                for (i = 0; i < modules.length; i++) {
                    modules[i].init();
                }
                populateDroplists();
            }, 1500);
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

    /**
     * Returns all modules that RPH Tools has loaded
     * @returns A list of all modules that have been loaded into the script.
     */
    var getModules = function () {
        return modules;
    };

    var registerDroplist = function (droplist) {
        moduleDroplists.push(droplist);
    };

    var populateDroplists = function () {
        moduleDroplists.forEach((droplist, index) => {
            droplist.empty();
            for (var name in namesToIds) {
                addToDroplist(namesToIds[name], name, droplist);
            }
        });
    };

    return {
        init: init,
        getModule: getModule,
        getModules: getModules,
        registerDroplist: registerDroplist,

        getHtml: function () {
            return html;
        },
        toString: function () {
            return 'RPH Tools Module';
        },
        getNamesToIds: function () {
            return namesToIds;
        },
        getIdsToNames: function () {
            return idsToNames;
        },
    };
}());