/**
 * This module handles chat modding features. These include an easier way to
 * issue kicks, bans, promotions and demotions. It also can set up monitoring
 * of certain words and alert the mod.
 */
var moddingModule = (function () {
    var settings = {
        'alertWords': '',
        'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
    };

    var localStorageName = "modSettings";

    var html = {
        'tabId': 'modding-module',
        'tabName': 'Modding',
        'tabContents': '<h3>Modding</h3>' +
            '<div>' +
            '<h4>Shortcuts</h4><br />' +
            '<p><strong>Note:</strong> This must be done with the mod\'s chat tab selected.</p>' +
            '<p>General form: <span style="font-family: courier;">/[action] [username],[reason]</span>. The reason is optional. Example: /kick Alice,Being rude</p>' +
            '<p>Supported actions: kick, ban, unban, add-mod, remove-mod, add-owner, remove-owner</p>' +
            '</div>' +
            '<div>' +
            '<h4>Mod commands</h4><br />' +
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
            '<textarea name="modTargetTextInput" id="modTargetTextInput" rows=2 class="rpht_textarea"></textarea>' +
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
            '<h4>Word alerter</h4><br />' +
            '<p><strong>Note:</strong> Separate all entries with a pipe character ( | ). To disable, empty the textbox.</p>' +
            '<br/><br/>' +
            '<textarea name="alertTriggers" id="alertTriggers" rows=4 class="rpht_textarea"></textarea>' +
            '<br/><br/>' +
            '</div>'
    };

    var alertSound = null;

    var roomNamePairs = {};

    function init() {
        loadSettings();
        
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
                chatSocket.emit('modify', {
                    room: room,
                    userid: user.props.id,
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
            settingsModule.saveSettings(localStorageName, settings);
        });

        $('#modAlertUrl').blur(function () {
            if (validateSetting('modAlertUrl', 'url')) {
                settings.alertUrl = getInput('#modAlertUrl');
                settingsModule.saveSettings(localStorageName, settings);
                alertSound = new Audio(settings.alertUrl);
            }
        });

        $('#alertTriggers').blur(function () {
            settings.alertWords = $('#alertTriggers').val();
            settingsModule.saveSettings(localStorageName, settings);
        });
    };

    /**
     * Performs a modding action
     * @param {string} action Name of the action being performed
     */
    function modAction(action) {
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
    function emitModAction(action, targetName, modName, roomName, reasonMsg) {
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

    function findUserAsMod(userObj) {
        roomnames.forEach((roomname) => {
            var roomObj = getRoom(roomname);
            if (roomObj.props.mods.indexOf(userObj.props.id) > -1 ||
                roomObj.props.owners.indexOf(userObj.props.id) > -1) {
                addModRoomPair(userObj.props, roomname);
            }
        });
    };

    /**
     * Adds a key/value pair option to the Room-Name Pair droplist.
     * @param {number} userId User ID of the mod
     * @param {object} thisRoom Object containing the room data.
     */
    function addModRoomPair(userProps, roomName) {
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
    };

    function processFilterAction(action, modName, targetName, roomName) {
        moddingModule.emitModAction(action, targetName, modName, roomName, settings.autoKickMsg);
    }

    /**
     * Plays the alert sound
     */
    function playAlert() {
        alertSound.play();
    };

    function loadSettings() {
        var storedSettings = settingsModule.getSettings(localStorageName);
        if (storedSettings) {
            settings = storedSettings;
        }
        else {
            settings = {
                'alertWords': '',
                'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
            };
        }

        $('#modAlertUrl').val(settings.alertUrl);
        alertSound = new Audio(settings.alertUrl);

        $('#alertTriggers').val(settings.alertWords);
    }

    function getAlertWords() {
        return settings.alertWords;
    }

    function getHtml() {
        return html;
    }

    function toString() {
        return 'Modding Module';
    }

    return {
        init: init,
        emitModAction: emitModAction,
        findUserAsMod: findUserAsMod,
        addModRoomPair: addModRoomPair,
        playAlert: playAlert,
        loadSettings: loadSettings,
        getAlertWords: getAlertWords,
        getHtml: getHtml,
        toString: toString
    };
}());