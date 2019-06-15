/**
 * This module handles adding blocking of users. This is meant to supersede
 * RPH's blocking mechanisms since it isn't always reliable.
 */
var blockingModule = (function () {
    var blockedUsers = [];

    var localStorageName = 'blockingSettings';

    var html = {
        'tabId': 'blocking-module',
        'tabName': 'Blocking',
        'tabContents': '<h3>User blocking</h3>' +
            '<br /><br />' +
            '<label class="rpht_labels">User:</label><input type="text" id="nameCheckTextbox" name="nameCheckTextbox" placeholder="User to block">' +
            '<br /><br />' +
            '<button style="margin-left: 579px;" type="button" id="blockButton">Block</button></ br>' +
            '<p>Blocked users</p>' +
            '<select style="width: 611px;" size="12" id="blockedDropList"></select>' +
            '<br /><br />' +
            '<button style="margin-left: 561px;" type="button" id="unblockButton">Unblock</button>'
    };

    function init() {
        loadSettings();

        $('#blockButton').click(function () {
            var username = $('#nameCheckTextbox').val();
            if (username) {
                getUserByName(username, function (user) {
                    addToBlockList(user);
                    user.blocked = true;
                    settingsModule.saveSettings(localStorageName, blockedUsers);
                });
            }
        });

        $('#unblockButton').click(function () {
            var names = document.getElementById("blockedDropList");
            var userId = $('#blockedDropList option:selected').val();
            getUserById(userId, function (user) {
                socket.emit('unblock', {
                    'id': user.props.id
                });
                names.remove(names.selectedIndex);
                user.blocked = false;
                blockedUsers.splice(blockedUsers.indexOf(userId), 1);
                settingsModule.saveSettings(localStorageName, blockedUsers);
            });
        });

        socket.on('ignores', function (data) {
            getUserById(data.ids[0], function (user) {
                addToBlockList(user);
                user.blocked = true;
                settingsModule.saveSettings(localStorageName, blockedUsers);
            });
        });

        $('#blockedDropList').empty();
        blockedUsers.forEach(function (blockedUser) {
            $('#blockedDropList').append('<option value="' + blockedUser.id + '">' +
                blockedUser.name + '</option>');
        });

        reblockList();

        /* Applies blocking every minute, just to be sure. */
        setInterval(reblockList, 60 * 1000);
    };

    /**
     * Adds a user to the native and RPHT block list.
     * @param {object} User object for the username being blocked
     */
    function addToBlockList(user) {
        var inList = false;

        for (var i = 0; i < blockedUsers.length && !inList; i++) {
            if (user.props.id == blockedUsers[i].id) {
                inList = true;
            }
        }

        if (!inList) {
            blockedUsers.push({
                id: user.props.id,
                name: user.props.name
            });
            $('#blockedDropList').append('<option value="' + user.props.id + '">' +
                user.props.name + '</option>');
        }
    };

    /**
     * Blocks everyone on the list. Used to refresh blocking.
     */
    function reblockList() {
        blockedUsers.forEach(function (blockedUser) {
            getUserById(blockedUser.id, function (user) {
                addToBlockList(user);
                user.blocked = true;
            });
        });
    };

    function loadSettings() {
        var storedSettings = settingsModule.getSettings(localStorageName);
        if (storedSettings) {
            blockedUsers = storedSettings;
        }
        else {
            blockedUsers = [];
        }
        $('#blockedDropList').empty();
        reblockList();
    }

    function getHtml() {
        return html;
    }

    function toString() {
        return 'Blocking Module';
    }

    return {
        init: init,
        loadSettings: loadSettings,
        getHtml: getHtml,
        toString: toString,
    };
}());