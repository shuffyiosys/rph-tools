/**
 * This module handles chat modding features. These include an easier way to
 * issue kicks, bans, promotions and demotions. It also can set up monitoring
 * of certain words and alert the mod.
 */
var moddingModule = (function () {
    var settings = {
        'alertWords': [],
        'kickWords': [],
        'enableAutoKick': false,
        'enableAutoBan': false,
        'autoKickMsg': '',
        'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
    };

    var localStorageName = "rpht_modSettings";

    var html = {
        'tabId': 'modding-module',
        'tabName': 'Modding',
        'tabContents': '<h3>Modding</h3>' +
            '<div>' +
            '<h4>Shortcuts</h4><br />' +
            '<p><strong>Note:</strong>This must be done with the mod\'s chat tab selected.</p>' +
            '<p>/kick [username],[reason] - Kicks a person from the chat room with the reason. Example: /kick Alice,Being rude</p>' +
            '<p>/ban [username],[reason] - Bans a person from the chat room with the reason (optional). Example: /ban Bob,Being rude</p>' +
            '<p>/unban [username],[reason] - Unbans a person from the chat room with the reason (optional). </p>' +
            '</div>' +
            '<div>' +
            '<h4>Mod commands</h4><br />' +
            '<p>This will only work if you\'re actually a mod and you own the user name.</p>' +
            '<br />' +
            '<label class="rpht_labels">Room-Name pair</label>' +
            '<select style="width: 300px;" id="roomModSelect">' +
            '<option value="">&lt;Blank out fields&gt;</option>' +
            '</select>' +
            '<br/><br/>' +
            '<label class="rpht_labels">Room:</label><input style="width: 300px;" type="text" id="modRoomTextInput" placeholder="Room">' +
            '<br/><br/>' +
            '<label class="rpht_labels">Mod name:</label><input style="width: 300px;" type="text" id="modFromTextInput" placeholder="Your mod name">' +
            '<br/><br/>' +
            '<label class="rpht_labels">Message:</label><input style="width: 300px;" type="text" id="modMessageTextInput" placeholder="Message">' +
            '<br/><br/>' +
            '<p>Perform action on these users (comma separated): </p>' +
            '<textarea name="modTargetTextInput" id="modTargetTextInput" rows=6 class="rpht_textarea"></textarea>' +
            '<br/><br/>' +
            '<button style="width: 60px;" type="button" id="kickButton">Kick</button>' +
            '<button style="margin-left: 30px; width: 60px;" type="button" id="banButton">Ban</button>' +
            '<button style="margin-left: 6px;  width: 60px;" type="button" id="unbanButton">Unban</button>' +
            '<button style="margin-left: 30px; width: 60px;" type="button" id="modButton">Mod</button>' +
            '<button style="margin-left: 6px;  width: 60px;" type="button" id="unmodButton">Unmod</button>' +
            '<button style="margin-left: 30px; width: 60px;" type="button" id="OwnButton">Owner</button>' +
            '<button style="margin-left: 6px;  width: 60px;" type="button" id="UnownButton">Unowner</button>' +
            '<br/><br/>' +
            '<button type="button" id="resetPwButton">Reset PW</button>' +
            '<br/><br/>' +
            '</div><div>' +
            '<h4>Word Alerter</h4><br />' +
            '<p>Words to trigger alert (comma separated, no spaces)</p>' +
            '<textarea name="modAlertWords" id="modAlertWords" rows=6 class="rpht_textarea"></textarea>' +
            '<br/><br/>' +
            '<label class="rpht_labels">Alert Sound URL: </label><input style="width: 370px;" type="text" id="modAlertUrl" name="modAlertUrl">' +
            '<br/><br/>' +
            '</div><div>' +
            '<h4>Auto-kick/ban</h4><br />' +
            '<p>Triggers (separate by pipe | )</p>' +
            '<textarea name="autoKickTriggers" id="autoKickTriggers" rows=6 class="rpht_textarea"></textarea>' +
            '<br/><br/>' +
            '<label class="rpht_labels">Message:</label><input style="width: 300px;" type="text" id="autoKickMessage" placeholder="Message">' +
            '<br/>' +
            '<label class="rpht_labels">Enable autokick</label><input style="width: 40px;" type="checkbox" id="autoKickEnable" name="autoKickEnable">' +
            '<br/>' +
            '<label class="rpht_labels">Ban instead of kick</label><input style="width: 40px;" type="checkbox" id="autoBanEnable" name="autoBanEnable">' +
            '</div>'

    };

    var alertSound = null;

    var roomNamePairs = {};

    const actionToString = {
        'ban': 'Banning: ',
        'unban': 'Unbanning: ',
        'add-mod': 'Adding mod: ',
        'remove-mod': 'Removing mod: ',
        'add-owner': 'Adding owner: ',
        'remove-owner': 'Removing owner: ',
        'kick': 'Kicking: '
    };

    var init = function () {
        loadSettings(JSON.parse(localStorage.getItem(localStorageName)));

        $('#roomModSelect').change(function () {
            var roomModeIdx = $('#roomModSelect')[0].selectedIndex;
            var roomModVal = $('#roomModSelect')[0].options[roomModeIdx].value;
            if (roomNamePairs[roomModVal]) {
                $('input#modRoomTextInput').val(roomNamePairs[roomModVal].roomName);
                $('input#modFromTextInput').val(roomNamePairs[roomModVal].modName);
            } else {
                $('input#modRoomTextInput').val("");
                $('input#modFromTextInput').val("");
            }
        });

        $('#resetPwButton').click(function () {
            var room = $('input#modRoomTextInput').val();

            getUserByName($('input#modFromTextInput').val(), function (user) {
                var userId = user.props.id;
                chatSocket.emit('modify', {
                    room: room,
                    userid: userId,
                    props: {
                        pw: false
                    }
                });
            });
        });

        $('#kickButton').click(function () {
            modAction('kick');
        });

        $('#banButton').click(function () {
            modAction('ban');
        });

        $('#unbanButton').click(function () {
            modAction('unban');
        });

        $('#modButton').click(function () {
            modAction('add-mod');
        });

        $('#unmodButton').click(function () {
            modAction('remove-mod');
        });

        $('#OwnButton').click(function () {
            modAction('add-owner');
        });

        $('#UnOwnButton').click(function () {
            modAction('remove-owner');
        });

        $('#modAlertWords').blur(function () {
            settings.alertWords = $('#modAlertWords').val().replace(/\r?\n|\r/, '');
            saveSettings();
        });

        $('#modAlertUrl').blur(function () {
            if (validateSetting('modAlertUrl', 'url')) {
                settings.alertUrl = getInput('#modAlertUrl');
                saveSettings();
                alertSound = new Audio(settings.alertUrl);
            }
        });

        $('#autoKickTriggers').blur(() => {
            settings.kickWords = $('#autoKickTriggers').val();
            saveSettings();
        });

        $('#autoKickEnable').change(() => {
            settings.enableAutoKick = getCheckBox('#autoKickEnable');
            saveSettings();
        });

        $('#autoBanEnable').change(() => {
            settings.enableAutoBan = getCheckBox('#autoBanEnable');
            saveSettings();
        });

        $('#autoKickMessage').blur(() => {
            settings.autoKickMsg = $('#autoKickMessage').val();
            saveSettings();
        });
    };

    /**
     * Performs a modding action
     * @param {string} action Name of the action being performed
     */
    var modAction = function (action) {
        var targets = $('#modTargetTextInput').val().replace(/\r?\n|\r/, '');
        targets = targets.split(',');
        console.log('RPH Tools[modAction]: Performing', action, 'on', targets);

        targets.forEach(function (target) {
            emitModAction(action, target, $('input#modFromTextInput').val(),
                $('input#modRoomTextInput').val(),
                $("input#modMessageTextInput").val());
        });
    };

    /**
     * Sends off the mod action to the chat socket
     * @param {string} action Name of the action being performed
     * @param {string} targetName User name of the recipient of the action
     */
    var emitModAction = function (action, targetName, modName, roomName, reasonMsg) {
        getUserByName(targetName, function (target) {
            getUserByName(modName, function (user) {
                var modMessage = '';
                if (action === 'kick' || action === 'ban' || action === 'unban') {
                    modMessage = reasonMsg;
                }
                chatSocket.emit(action, {
                    room: roomName,
                    userid: user.props.id,
                    targetid: target.props.id,
                    msg: modMessage
                });
            });
        });
    };

    var findUserAsMod = function (userObj) {
        roomnames.forEach((roomname) => {
            var roomObj = getRoom(roomname);
            if (roomObj.props.mods.indexOf(userObj.props.id) > -1 ||
                roomObj.props.owners.indexOf(userObj.props.id) > -1) {
                addModRoomPair(userObj.props, roomname);
            }
        });
    }

    var findModOfRoom = function (roomName) {
        var modName = '';
        for (var key in roomNamePairs) {
            var pair = roomNamePairs[key]
            if (pair.roomName == roomName) {
                modName = pair.modName;
                break;
            }
        }
        return modName;
    }

    /**
     * Adds a key/value pair option to the Room-Name Pair droplist.
     * @param {number} userId User ID of the mod
     * @param {object} thisRoom Object containing the room data.
     */
    var addModRoomPair = function (userProps, roomName) {
        var roomNamePair = roomName + ': ' + userProps.name;
        var roomNameValue = roomName + '.' + userProps.id;
        var roomNameObj = {
            'roomName': roomName,
            'modName': userProps.name,
            'modId': userProps.id
        };

        if (roomNamePairs[roomNameValue] === undefined) {
            roomNamePairs[roomNameValue] = roomNameObj;
            $('#roomModSelect').append('<option value="' + roomNameValue + '">' +
                roomNamePair + '</option>');
        }
    }

    /**
     * Plays the alert sound
     */
    var playAlert = function () {
        if (alertSound !== null) {
            alertSound.play();
        }
    };

    var handleAutoKick = function (modName, targetName, roomName) {
        if (!settings.enableAutoKick && !settings.enableAutoBan) {
            return;
        }
        var action = settings.enableAutoBan ? 'ban' : 'kick';

        setTimeout(() => {
                moddingModule.emitModAction(action, targetName, modName, roomName, settings.autoKickMsg);
            },
            (Math.random() + 1) * 1000
        );
    }

    /**
     * Saves settings to local storage
     */
    var saveSettings = function () {
        localStorage.setItem(localStorageName, JSON.stringify(settings));
    };

    /** 
     * Loads saved settings if they exist
     */
    var loadSettings = function (storedSettings) {
        if (storedSettings) {
            settings = storedSettings;
            populateSettings();
        }
    };

    /**
     * Deleting saved settings.
     */
    var deleteSettings = function () {
        localStorage.removeItem(localStorageName);
        settings = {
            'alertWords': [],
            'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
        };
        populateSettings();
    };

    /**
     * Populates the GUI with the saved settings
     */
    var populateSettings = function () {
        $('#modAlertWords').val(settings.alertWords);
        $('#modAlertUrl').val(settings.alertUrl);
        alertSound = new Audio(settings.alertUrl);

        $('#autoKickTriggers').val(settings.kickWords);
        $('#autoKickMessage').val(settings.autoKickMsg);
        $('#autoKickEnable').prop('checked', settings.enableAutoKick);
        $('#autoBanEnable').prop('checked', settings.enableAutoBan);
    };

    return {
        init: init,
        emitModAction: emitModAction,
        findUserAsMod: findUserAsMod,
        findModOfRoom: findModOfRoom,
        addModRoomPair: addModRoomPair,
        playAlert: playAlert,
        handleAutoKick: handleAutoKick,
        loadSettings:loadSettings,
        deleteSettings: deleteSettings,

        getHtml: function () {
            return html;
        },
        toString: function () {
            return 'Modding Module';
        },
        getSettings: function () {
            return settings;
        },
    };
}());