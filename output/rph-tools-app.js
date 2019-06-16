// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    4.1.0
// @description Adds extended settings to RPH
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT
// ==/UserScript==

const VERSION_STRING = '4.1.0';

const SETTINGS_NAME = "rph_tools_settings";
/**
 * Gets the value from an input element.
 * @param {string} settingId Full selector of the input to get its value
 * @return The extracted HTML's value
 */
function getInput(settingId) {
    return $(settingId).val();
};

/**
 * Gets the value of a checkbox
 * @param {string} settingId Full selector of the checkbox to get the value
 * @return The extracted HTML's value
 */
function getCheckBox(settingId) {
    return $(settingId).is(':checked');
};

/**
 * Marks an HTML element with red or white if there's a problem
 * @param {string} element Full selector of the HTML element to mark
 * @param {boolean} mark If the mark is for good or bad
 */
function markProblem(element, mark) {
    if (mark === true) {
        $(element).css('background', '#FF7F7F');
    } else {
        $(element).css('background', '#FFF');
    }
};

/**
 * Checks to see if an input is valid or not and marks it accordingly
 * @param {string} settingId Full selector of the HTML element to check
 * @param {string} setting What kind of setting is being checked
 * @return If the input is valid or not
 */
function validateSetting(settingId, setting) {
    var validInput = false;
    var input = $(settingId).val();

    switch (setting) {
        case "url":
            validInput = validateUrl(input);
            break;

        case "color":
            validInput = validateColor(input);
            validInput = validateColorRange(input);
            break;
    }
    markProblem(settingId, !validInput);
    return validInput;
};

/**
 * Makes sure the color input is a valid hex color input
 * @param {string} color Color input
 * @returns If the color input is valid
 */
function validateColor(color) {
    var pattern = new RegExp(/(^#[0-9A-Fa-f]{6}$)|(^#[0-9A-Fa-f]{3}$)/i);
    return pattern.test(color);
};

/**
 * Makes sure the URL input is valid
 * @param {string} url URL input
 * @returns If the URL input is valid
 */
var validateUrl = function (url) {
    var match = false;
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    var pingExt = url.slice((url.length - 4), (url.length));

    if (url === '') {
        match = true;
    } else if (regexp.test(url) === true) {
        if (pingExt == ".wav" || pingExt == ".ogg" || pingExt == ".mp3") {
            match = true;
        }
    }
    return match;
};

/**
 * Makes sure the color is less than #DDDDDD or #DDD depending on how many
 * digits were entered.
 * @param {string} TextColor String representation of the color.
 * @return True if the color is within range, false otherwise.
 */
function validateColorRange(TextColor) {
    var rawHex = TextColor.substring(1, TextColor.length);
    var validColor = false;
    var red = 255;
    var green = 255;
    var blue = 255;

    /* If the color text is 3 characters, limit it to #DDD */
    if (rawHex.length == 3) {
        red = parseInt(rawHex.substring(0, 1), 16);
        green = parseInt(rawHex.substring(1, 2), 16);
        blue = parseInt(rawHex.substring(2, 3), 16);

        if ((red <= 0xD) && (green <= 0xD) && (blue <= 0xD)) {
            validColor = true;
        }
    }
    /* If the color text is 6 characters, limit it to #DDDDDD */
    else if (rawHex.length == 6) {
        red = parseInt(rawHex.substring(0, 2), 16);
        green = parseInt(rawHex.substring(2, 4), 16);
        blue = parseInt(rawHex.substring(4, 6), 16);
        if ((red <= 0xDD) && (green <= 0xDD) && (blue <= 0xDD)) {
            validColor = true;
        }
    }
    return validColor;
};

/**
 * Adds an option to a select element with a value and its label
 * @param {string} value Value of the option element
 * @param {string} label Label of the option element
 * @param {object} droplist Which select element to add option to
 */
function addToDroplist(value, label, droplist) {
    var droplist_elem = $(droplist);
    droplist_elem.append($('<option>', {
        value: value,
        text: label
    }));
};

/**
 * Un an array of objects, return the first instance where a key matches the
 * value being searched.
 * @param {array} objArray Array of objects
 * @param {*} key Key to look for
 * @param {*} value Value of the key to match
 * @return Index of the first instance where the key matches the value, -1 
 *         otherwise.
 */
function arrayObjectIndexOf(objArray, key, value) {
    for (var i = 0; i < objArray.length; i++) {
        if (objArray[i][key] === value) {
            return i;
        }
    }
    return -1;
};

/**
 * Checks if a search term is in an <a href=...> tag.
 * @param {string} searchTerm Search term to look for
 * @param {string} msg The string being looked at
 * @returns True or false if there's a match.
 */
function isInLink(searchTerm, msg) {
    var regexp = new RegExp('href=".*?' + searchTerm + '.*?"', '');
    return regexp.test(msg);
};

/**
 * Checks if the current account is a mod of the room.
 * @param {object} room Object containing room data
 */
function isModOfRoom(room) {
    var isMod = false;
    for (var idx = 0; idx < account.userids.length && !isMod; idx++) {
        if (room.props.mods.indexOf(account.userids[idx]) > -1 ||
            room.props.owners.indexOf(account.userids[idx]) > -1) {
            isMod = true;
        }
    }
    return isMod;
};

function getModForRoom(room){
    var modName = '';
    var users = account.users;
    for (var idx = 0; idx < users.length; idx++) {
        if (room.props.mods.includes(users[idx].props.id) ||
            room.props.owners.includes(users[idx].props.id)) {
            modName = users[idx].props.name;
            break;
        }
    }
    return modName;
}

/**
 * Takes a dictionary and creates a sorted version of it based on its keys
 * @param {object} dict Dictionary to be sorted
 * @returns Sorted dictionary
 */
function sortOnKeys (dict) {
    var sorted = [];
    for (var key in dict) {
        sorted[sorted.length] = key;
    }
    sorted.sort();

    var tempDict = {};
    for (var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i]] = dict[sorted[i]];
    }

    return tempDict;
}

function makeFullTimeStamp(timestamp){
    var timeObj = new Date(timestamp);
    var timestamp = timeObj.getHours().toString().padStart(2, '0') + ':';
    timestamp += timeObj.getMinutes().toString().padStart(2, '0') + ':';
    timestamp += timeObj.getSeconds().toString().padStart(2, '0');

    return timestamp
}

function getSortedNames() {
    var namesToIds = {};
    account.users.forEach(function (userObj) {
        namesToIds[userObj.props.name] = userObj.props.id;
    });
    namesToIds = sortOnKeys(namesToIds);
    return namesToIds;
}/**
 * Generates a hash value for a string
 * This was modified from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 */
String.prototype.hashCode = function () {
    var hash = 0,
        i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 31) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

/**
 * Modified handler for keyup events from the chat textbox
 * @param {object} ev - Event
 * @param {object} User - User the textbox is attached to
 * @param {oject} Room - Room the textbox is attached to
 */
function intputChatText(ev, User, Room) {
    var inputTextBox = null;
    Room.$tabs.forEach(function (roomTab) {
        var classesLen = roomTab[0].classList.length;
        if (roomTab[0].classList[classesLen - 1] === 'active') {
            inputTextBox = $('textarea.' + User.props.id + '_' + makeSafeForCss(Room.props.name));
        }
    });
    if (ev.keyCode === 13 && ev.ctrlKey === false && ev.shiftKey === false && inputTextBox.val() !== '' && inputTextBox.val().trim() !== '') {
        var newMessage = inputTextBox.val();
        if (newMessage.length > 4000) {
            Room.appendMessage(
                '<span class="first">&nbsp;</span>\n\
            <span title="' + makeTimestamp(false, true) + '">Message too long</span>'
            ).addClass('sys');
            return;
        }

        if (newMessage[0] === '/' && newMessage.substring(0, 2) !== '//' && chatModule) {
                chatModule.parseSlashCommand(inputTextBox, Room, User);
        } else {
            sendChatMessage(inputTextBox, Room, User);
        }
    }
}

function sendChatMessage(inputTextBox, Room, User) {
    var newMessage = inputTextBox.val();
    var thisTab = rph.tabs[User.props.id];
    var newLength = newMessage.length;
    Room.sendMessage(newMessage, User.props.id);
    inputTextBox.val('');

    if (newMessage.match(/\n/gi)) {
        newLength = newLength + (newMessage.match(/\n/gi).length * 250);
    }
    
    var curTime = Math.round(new Date().getTime() / 1000);
    thisTab.bufferLength = (thisTab.bufferLength / (curTime - thisTab.lastTime + 1)) + ((newLength + thisTab.bufferLength) / 3) + 250;
    thisTab.lastTime = curTime;
    if (thisTab.bufferLength > 1750) {
        thisTab.offenses += 1;
        if (thisTab.offenses > 2) {
            Room.sendMessage('Flood kick', User.props.id);
            chatSocket.disconnect();
            return;
        } else {
            Room.appendMessage(
                '<span class="first">&nbsp;</span>\n\
            <span title="' + makeTimestamp(false, true) + '">You are flooding. Be careful or you\'ll be kicked</span>'
            ).addClass('sys');
            setTimeout(function () {
                thisTab.offenses = 0;
            }, 15000);
            return;
        }
    }
}/****
 * This module handles the chat functions of the script.
 ****/
var chatModule = (function () {
    var pingSettings = {
        'triggers': [],
        'audioUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
        'color': '#000',
        'highlight': '#FFA',
        'bold': false,
        'italics': false,
        'exact': false,
        'case': false,
    };

    var localStorageName = "chatSettings";

    var pingSound = null;

    var autoDismissTimer = null;

    var html = {
        'tabId': 'chat-module',
        'tabName': 'Chat',
        'tabContents': '<h3>Chat room settings</h3>' +
            '<div>' +
            '<h4>User text color</h4>' +
            '<p><strong>Shortcut:</strong> /color [HTML color] - Changes the text color of the current username</p>' +
            '<br /><br />' +
            '<label class="rpht_labels">Username:</label><select  style="width: 300px;" id="userColorDroplist"></select>' +
            '<br /><br />' +
            '<label class="rpht_labels">Text color:</label><input style="width: 300px;" type="text" id="userNameTextColor" name="userNameTextColor" value="#111">' +
            '<br /><br />' +
            '<label class="rpht_labels">Color preview: </label><span id="colorPreview">This is a sample text</span>' +
            '<br /><br />' +
            '<button style="margin-left: 557px;" type="button" id="userNameTextColorButton">Set color</button>' +
            '</div><div>' +
            '<h4>Pings</h4>' +
            '<p>Names to be pinged (comma separated)</p>' +
            '<br />' +
            '<textarea id="pingNames" name="pingNames" rows="8" class="rpht_textarea"> </textarea>' +
            '<br /><br />' +
            '<label class="rpht_labels">Ping URL: </label><input type="text" id="pingURL" name="pingURL">' +
            '<br /><br />' +
            '<label class="rpht_labels">Text Color: </label><input type="text" id="pingTextColor" name="pingTextColor" value="#000">' +
            '<br /><br />' +
            '<label class="rpht_labels">Highlight: </label><input type="text" id="pingHighlightColor" name="pingHighlightColor" value="#FFA">' +
            '<br /><br />' +
            '<p>Matching options</p> <br/>' +
            '<input style="width: 40px;" type="checkbox" id="pingBoldEnable" name="pingBoldEnable"><strong>Bold</strong>' +
            '<input style="width: 40px;" type="checkbox" id="pingItalicsEnable" name="pingItalicsEnable"><em>Italics</em>' +
            '<input style="width: 40px;" type="checkbox" id="pingExactMatch" name="pingExactMatch">Exact match' +
            '<input style="width: 40px;" type="checkbox" id="pingCaseSense" name="pingCaseSense">Case sensitive' +
            '<br /><br />' +
            '<label class="rpht_labels">Ping Tester: </label><input type="text" id="pingPreviewInput" name="pingPreviewInput">' +
            '<br /><br />' +
            '<label class="rpht_labels">Ping preview:</label><span id="pingPreviewText"></span>' +
            '</div>'
    }

    function init() {
        loadSettings();

        $('#userNameTextColorButton').click(function () {
            changeTextColor();
        });

        $('#userNameTextColor').change(function () {
            if (validateColorRange(getInput('#userNameTextColor'))) {
                $('#colorPreview').css('color', getInput('#userNameTextColor'));
            }
        });

        $('#pingNames').blur(function () {
            var triggers = $('#pingNames').val().replace('\n', '').replace('\r', '');
            pingSettings.triggers = triggers;
            saveSettings();
        });

        $('#pingURL').blur(function () {
            if (validateSetting('#pingURL', 'url')) {
                pingSettings.audioUrl = getInput('#pingURL');
                pingSound = new Audio(pingSettings.audioUrl);
                saveSettings();
            }
        });

        $('#pingTextColor').blur(function () {
            if (validateColor(getInput('#pingTextColor'))) {
                pingSettings.color = getInput('#pingTextColor');
                saveSettings();
                markProblem('#pingHighlightColor', false);
            } else {
                markProblem('#pingHighlightColor', true);
            }
        });

        $('#pingHighlightColor').blur(function () {
            if (validateColor(getInput('#pingHighlightColor'))) {
                pingSettings.highlight = getInput('#pingHighlightColor');
                saveSettings();
                markProblem('#pingHighlightColor', false);
            } else {
                markProblem('#pingHighlightColor', true);
            }
        });

        $('#pingBoldEnable').change(function () {
            pingSettings.bold = getCheckBox('#pingBoldEnable');
            saveSettings();
        });

        $('#pingItalicsEnable').change(function () {
            pingSettings.italics = getCheckBox('#pingItalicsEnable');
            saveSettings();
        });

        $('#pingExactMatch').change(function () {
            pingSettings.exact = getCheckBox('#pingExactMatch');
            saveSettings();
        });

        $('#pingCaseSense').change(function () {
            pingSettings.case = getCheckBox('#pingCaseSense');
            saveSettings();
        });

        $('#pingPreviewInput').blur(function () {
            var msg = getInput('#pingPreviewInput');
            var testRegex = matchPing(msg, pingSettings.triggers, pingSettings.case,
                pingSettings.exact);
            if (testRegex !== null) {
                msg = highlightPing(msg, testRegex, pingSettings.color,
                    pingSettings.highlight, pingSettings.bold,
                    pingSettings.italics);
                pingSound.play();
                $('#pingPreviewText')[0].innerHTML = msg;
            } else {
                $('#pingPreviewText')[0].innerHTML = "No match";
            }
        });

        $('#showUsername').change(() => {
            pingSettings.case = getCheckBox('#pingCaseSense');
            saveSettings();
        });

        $(window).resize(resizeChatTabs);

        socket.on('accounts', () => {
            setTimeout(function () {
                var namesToIds = [];
                account.users.forEach(function (userObj) {
                    namesToIds[userObj.props.name] = userObj.props.id;
                });
                namesToIds = sortOnKeys(namesToIds);
                $('#userColorDroplist').empty();
                for (var name in namesToIds) {
                    addToDroplist(namesToIds[name], name, "#userColorDroplist");
                }
            }, 3000);
        });

        chatSocket.on('confirm-room-join', function (data) {
            roomSetup(data);
        });

        chatSocket.on('room-users-leave', function (data) {
            var sessionModule = rphToolsModule.getModule('Session Module');
            if (sessionModule === null) {
                return;
            }
    
            data.users.forEach((userId) => {
                if (account.userids.indexOf(userId) > -1) {
                    sessionModule.removeRoomFromSession(data.room, userId);
                }
            });
        });

        /* Setup the timer for automatically dismissing the opening dialog once
           rooms are available. The timer clears after. */
        autoDismissTimer = setInterval(function () {
            if (roomnames.length === 0) {
                return;
            }
            $("button span:contains('Continue')").trigger('click');
            clearTimeout(autoDismissTimer);
        }, 500);
    }

    /**
     * When user joins a room, do the following:
     * - Set up the .onMessage function for pinging
     * - Add the user's name to the chat tab and textarea
     * - Create a room-pair name for the Modding section
     * - Add the room the session.
     * @param {object} room Room that the user has joined
     */
    function roomSetup(room) {
        var thisRoom = getRoom(room.room);
        var userId = getIdFromChatTab(thisRoom);
        var moddingModule = rphToolsModule.getModule('Modding Module');
        var sessionModule = rphToolsModule.getModule('Session Module');

        thisRoom.onMessage = function (data) {
            var thisRoom = this;
            if (account.ignores.indexOf(data.userid) !== -1) {
                return;
            }

            getUserById(data.userid, function (User) {
                postMessage(thisRoom, data, User);
            });
        };

        getUserById(userId, (User) => {
            addNameToUI(thisRoom, User);

            if (moddingModule !== null && isModOfRoom(thisRoom)) {
                moddingModule.addModRoomPair(User.props, thisRoom.props.name);
            }

            if (sessionModule !== null) {
                sessionModule.addRoomToSession(room.room, userId);
            }

            resizeChatTabs();
            var chatTextArea = $('textarea.' + User.props.id + '_' + makeSafeForCss(thisRoom.props.name));
            chatTextArea.unbind('keyup');
            chatTextArea.bind('keyup', function (ev) {
                intputChatText(ev, User, thisRoom);
            });
        });
    };

    /**
     * Takes a message received in the chat and processes it for pinging or 
     * otherwise
     * @param {object} thisRoom The room that the message is for.
     * @param {object} data The message for the room
     */
    function postMessage(thisRoom, data, User) {
        var timestamp = makeFullTimeStamp(data.time);
        var msg = parseMsg(data.msg);
        var classes = '';
        var $el = '';
        var msgHtml = '';
        var ownMessage = account.userids.includes(User.props.id);

        /* Process only if not own message */
        if (ownMessage === false) {
            var moddingModule = rphToolsModule.getModule('Modding Module');

            /* Perform mod actions */
            if (moddingModule !== null && isModOfRoom(thisRoom)) {
                var modSettings = moddingModule.getAlertWords();
                testRegex = matchPing(msg, modSettings.alertWords, false, true);

                // Process alert
                if (modSettings.alertWords) {
                    var alertRegex = new RegExp(modSettings.alertWords, 'gi');
                    if (msg.match(alertRegex)) {
                        msg = highlightPing(msg, alertRegex, "#EEE", "#E00", true, false);
                        highlightRoom(thisRoom, "#EEE", "#E00");
                        moddingModule.playAlert();
                    }
                }
            }
        }

        /* If there's a verification mark, check to see if it's good */
        if (msg.indexOf('\u200b') > -1) {
            var verifiedMsg = verifyMessage(msg);
            msg = msg.substring(0, msg.indexOf('\u200b'));
            if (verifiedMsg) {
                msg += ' <span style="background:#4A4; color: #000;">&#9745;</span>';
            } else {
                msg += ' <span style="background:#A44; color: #000;">&#x1f6c7;</span>';
            }

        }

        /* Add pinging higlights */
        try {
            var testRegex = null;
            testRegex = matchPing(msg, pingSettings.triggers, pingSettings.case,
                pingSettings.exact);
            if (testRegex !== null) {
                msg = highlightPing(msg, testRegex, pingSettings.color,
                    pingSettings.highlight, pingSettings.bold,
                    pingSettings.italics);
                highlightRoom(thisRoom, pingSettings.color, pingSettings.highlight);
                pingSound.play();
            }
        } catch (err) {
            console.log('RPH Tools[postMessage]: I tried pinging D:', err);
            msg = parseMsg(data.msg);
        }

        if (msg.charAt(0) === '/' && msg.slice(1, 3) === 'me') {
            classes += 'action ';
            msg = msg.slice(3);
            msgHtml = '<span class="first">[' + timestamp +
                ']</span>\n<span style="color:#' + User.props.color +
                '"><a class="name" title="[' + timestamp +
                ']" style="color:#' + User.props.color +
                '">' + User.props.name + '</a>' + msg + '</span>';
        } else {
            msgHtml = '<span class="first">[' + timestamp + ']<a class="name" title="[' +
                timestamp + ']" style="color:#' + User.props.color + '">' +
                User.props.name +
                '<span class="colon">:</span></a></span>\n<span style="color:#' +
                User.props.color + '">' + msg + '</span>';
        }

        $el = thisRoom.appendMessage(msgHtml).addClass(classes);
        $el.find('br:gt(7)').remove();
    };

    /**
     * If a verification mark (Unicode 200B) was in the message, check to see
     * if it's valid by comparing the hash received vs. the original message.
     * 
     * @param {String} message - Incoming message
     */
    function verifyMessage(message) {
        var delimitChar = message.indexOf('\u200b');
        var recvdHash = message.substring(delimitChar + 1);
        var origMsg = message.substring(0, delimitChar);

        return (origMsg.hashCode() == parseInt(recvdHash));
    };

    /**
     * Parses a slash command from an input source.
     * @param {object} inputTextBox HTML element that holds the input textbox
     * @param {object} Room Room data
     * @param {object} User User data
     */
    function parseSlashCommand(inputTextBox, Room, User) {
        var newMessage = inputTextBox.val();
        var error = false;
        var cmdArgs = newMessage.split(/ (.+)/);

        switch (cmdArgs[0]) {
            case '/status':
            case '/away':
                if (cmdArgs.length < 2) {
                    error = true;
                } else {
                    var type = 0;
                    if (cmdArgs[0] === '/away') {
                        type = 1;
                    }
                    socket.emit('modify', {
                        userid: User.props.id,
                        statusMsg: cmdArgs[1],
                        statusType: type
                    });
                    inputTextBox.val('');
                }
                break;
            case '/color':
                if (cmdArgs.length < 2) {
                    error = true;
                } else if (validateColor(cmdArgs[1]) && validateColorRange(cmdArgs[1])) {
                    socket.emit('modify', {
                        userid: User.props.id,
                        color: cmdArgs[1]
                    });
                    inputTextBox.css('color', cmdArgs[1]);
                } else {
                    error = true;
                }
                break;
            case '/coinflip':
                var rngModule = rphToolsModule.getModule('RNG Module');
                if (rngModule) {
                    inputTextBox.val(rngModule.genCoinFlip());
                    sendChatMessage(inputTextBox, Room, User);
                }
                break;
            case '/roll':
                var rngModule = rphToolsModule.getModule('RNG Module');
                if (rngModule) {
                    var die = 1;
                    var sides = 1000;

                    if (cmdArgs.length > 1) {
                        die = parseInt(cmdArgs[1].split('d')[0]);
                        sides = parseInt(cmdArgs[1].split('d')[1]);
                    }
                    if (isNaN(die) || isNaN(sides)) {
                        error = true;
                    } else {
                        inputTextBox.val(rngModule.getDiceRoll(die, sides, true));
                        sendChatMessage(inputTextBox, Room, User);
                    }
                }
                break;
            case '/kick':
            case '/ban':
            case '/unban':
            case '/add-owner':
            case '/add-mod':
            case '/remove-owner':
            case '/remove-mod':
                var moddingModule = rphToolsModule.getModule('Modding Module');
                if (cmdArgs.length < 2) {
                    error = true;
                } else if (moddingModule) {
                    var action = cmdArgs[0].substring(1, cmdArgs[0].length);
                    var commaIdx = cmdArgs[1].indexOf(',');
                    var targetName = cmdArgs[1];
                    var reason = '';
                    if (commaIdx > -1) {
                        targetName = cmdArgs[1].substring(0, commaIdx);
                        reason = cmdArgs[1].substring(commaIdx + 1, cmdArgs[1].length);
                    }
                    moddingModule.emitModAction(action, targetName, User.props.name,
                        Room.props.name, reason);
                    inputTextBox.val('');
                }
                break;
            default:
                sendChatMessage(inputTextBox, Room, User);
                break;
        }

        if (error) {
            Room.appendMessage(
                '<span class="first">&nbsp;</span>\n\
      <span title="' + makeTimestamp(false, true) + '">Error in command input</span>'
            ).addClass('sys');
        }
    }

    /**
     * Checks if the message has any ping terms
     * @param {string} msg - The message for the chat
     * @returns Returns the match or null
     */
    function matchPing(msg, triggers, caseSensitive, exactMatch) {
        if (!triggers) {
            return null;
        } else if (triggers.length === 0) {
            return null;
        }

        var testRegex = null;
        var pingNames = triggers.split(',');
        var regexParam = (caseSensitive ? "m" : 'im');
        if (triggers.length === 0) {
            return testRegex;
        }

        for (i = 0; i < pingNames.length; i++) {
            if (pingNames[i] !== "") {
                var regexPattern = pingNames[i].trim();
                if (exactMatch === true) {
                    regexPattern = "\\b" + pingNames[i].trim() + "\\b";
                }

                /* Check if search term is not in a link. */
                if (isInLink(pingNames[i], msg) === false) {
                    testRegex = new RegExp(regexPattern, regexParam);
                    if (msg.match(testRegex)) {
                        return testRegex;
                    }
                }
            }
        }
        return null;
    };

    /**
     * Adds highlights to the ping term
     * @param {string} msg - Message to be sent to the chat.
     * @param {regex} testRegex - Regular expression to use to match the term.
     * @returns Modified message
     */
    function highlightPing(msg, testRegex, color, highlight, bold, italicize) {
        var boldStyle = "";
        var italicsStyle = "";

        if (bold === true) {
            boldStyle = "font-weight: bold; ";
        }
        if (italicize === true) {
            italicsStyle = "font-style:italic; ";
        }
        msg = msg.replace(testRegex, '<span style="color: ' + color +
            '; background: ' + highlight + '; ' + boldStyle +
            italicsStyle + '">' + msg.match(testRegex) + '</span>');
        return msg;
    };

    /**
     * Adds a highlight to the room's tab
     * @param {object} thisRoom - Room where the ping happened.
     */
    function highlightRoom(thisRoom, color, highlight) {
        if (!thisRoom.isActive()) {
            thisRoom.$tabs[0].css('background-color', highlight);
            thisRoom.$tabs[0].css('color', color);

            thisRoom.$tabs[0].click(function () {
                thisRoom.$tabs[0].css('background-color', '#333');
                thisRoom.$tabs[0].css('color', '#6F9FB9');

                thisRoom.$tabs[0].hover(function () {
                    thisRoom.$tabs[0].css('background-color', '#6F9FB9');
                    thisRoom.$tabs[0].css('color', '#333');
                }, function () {
                    thisRoom.$tabs[0].css('background-color', '#333');
                    thisRoom.$tabs[0].css('color', '#6F9FB9');
                });
            });
        }
    };

    /**
     * Adds user name to chat tab and chat textarea
     * @param {object} thisRoom - Room that was entered
     * @param {number} userId - ID of the user that entered
     **/
    function addNameToUI(thisRoom, User) {
        var tabsLen = thisRoom.$tabs.length;
        var idRoomName = thisRoom.$tabs[tabsLen - 1][0].className.split(' ')[2];
        var newTabHtml = '<span>' + thisRoom.props.name +
            '</span><p style="font-size: x-small; margin-top: -58px;">' +
            User.props.name + '</p>';
        thisRoom.$tabs[tabsLen - 1].html(newTabHtml);
        $('<a class="close ui-corner-all">x</a>').on('click', (ev) => {
            ev.stopPropagation();
            chatSocket.emit('leave', {
                userid: User.props.id,
                name: thisRoom.props.name
            });
        }).appendTo(thisRoom.$tabs[tabsLen - 1]);
        $('textarea.' + idRoomName).prop('placeholder', 'Post as ' + User.props.name);
        $('textarea.' + idRoomName).css('color', "#" + User.props.color);
    };

    /**
     * Gets the user's ID from the chat tab (it's in the class)
     * @param {} thisRoom - Room to get the ID from
     **/
    function getIdFromChatTab(thisRoom) {
        var tabsLen = thisRoom.$tabs.length;
        var className = thisRoom.$tabs[tabsLen - 1][0].className;
        var charID = className.match(new RegExp(' [0-9]+', ''))[0];
        charID = charID.substring(1, charID.length);
        return parseInt(charID);
    };

    /**
     * Resizes chat tabs based on the width of the tabs vs. the screen size.
     */
    function resizeChatTabs() {
        $('#chat-tabs').addClass('rpht_chat_tab');
        /* Window is smaller than the tabs width */
        if ($('#chat-tabs')[0].clientWidth < $('#chat-tabs')[0].scrollWidth ||
            $('#chat-tabs')[0].clientWidth > $('#chat-bottom')[0].clientWidth) {
            $('#chat-top').css('padding-bottom', '136px');
            $('#chat-bottom').css('margin-top', '-138px');
        } else {
            $('#chat-top').css('padding-bottom', '120px');
            $('#chat-bottom').css('margin-top', '-118px');
        }
        // Debouce the function.
        $(window).off("resize", resizeChatTabs);
        setTimeout(() => {
            $(window).resize(resizeChatTabs);
        }, 100);
    };

    /**
     * Handlers for text color changing
     */
    function changeTextColor() {
        var textColor = $('input#userNameTextColor').val();
        if (validateSetting('input#userNameTextColor', 'color') === true) {
            var userId = $('#userColorDroplist option:selected').val();
            textColor = textColor.substring(1, textColor.length);
            socket.emit('modify', {
                userid: userId,
                color: textColor
            });
        }
    };

    /**
     * Save current settings
     */
    function saveSettings() {
        settingsModule.saveSettings(localStorageName, pingSettings);
    };
    /**
     * Loads settings from local storage
     * @param {object} storedSettings Object containing the settings
     */
    function loadSettings () {
        var storedSettings = settingsModule.getSettings(localStorageName);
        if (storedSettings) {
            pingSettings = storedSettings;
        }
        else {
            pingSettings = {
                'triggers': [],
                'audioUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
                'color': '#000',
                'highlight': '#FFA',
                'bold': false,
                'italics': false,
                'exact': false,
                'case': false,
            };
        }

        $('#pingNames').val(pingSettings.triggers);
        $('#pingURL').val(pingSettings.audioUrl);
        $('#pingTextColor').val(pingSettings.color);
        $('#pingHighlightColor').val(pingSettings.highlight);
        $('input#pingBoldEnable').prop("checked", pingSettings.bold);
        $('input#pingItalicsEnable').prop("checked", pingSettings.italics);
        $('input#pingExactMatch').prop("checked", pingSettings.exact);
        $('input#pingCaseSense').prop("checked", pingSettings.case);
        pingSound = new Audio(pingSettings.audioUrl);
    }

    function getHtml() {
        return html;
    }

    function toString() {
        return 'Chat Module';
    }

    return {
        init: init,
        parseSlashCommand: parseSlashCommand,
        loadSettings: loadSettings,
        getHtml: getHtml,
        toString: toString
    };
}());/**
 * This module handles the "Session" section in RPH Tools
 */
var sessionModule = (function () {
    var sessionSettings = {
        'autoRefreshAttempts': 5,
        'dcHappened': false,
        'autoRefresh': false,
        'chatTextboxSave': false,
        'pmTextboxSave': false,
        'refreshSecs': 15,
        'joinFavorites': false,
        'joinSession': false,
        'roomSession': [],
        'favRooms': [],
        'chatTextboxes': [],
        'pmTextboxes': []
    };

    var localStorageName = "sessionSettings";

    var autoJoinTimer = null;

    var sessionShadow = [];

    var MAX_ROOMS = 30;

    var AUTOJOIN_TIMEOUT_SEC = 5 * 1000;

    var MAX_AUTO_REFRESH_ATTEMPTS = 5;

    var REFRESH_ATTEMPTS_TIMEOUT = 10 * 60 * 1000;

    var AUTOJOIN_INTERVAL = 2 * 1000

    var html = {
        'tabId': 'session-module',
        'tabName': 'Sessions',
        'tabContents': '<h3>Sessions</h3>' +
            '<div>' +
            '<h4>Auto Refresh</h4> <strong>Note:</strong> This will not re-join rooms with passwords.' +
            '<br /><br />' +
            '<label class="rpht_labels">Refresh on Disconnect: </label><input style="width: 40px;" type="checkbox" id="dcRefresh" name="dcRefresh">' +
            '<br /><br />' +
            '<label class="rpht_labels">Auto-refresh time: </label><input style="width: 64px;" type="number" id="refreshTime" name="refreshTime" max="60" min="5" value="10"> seconds' +
            '<br /><br />' +
            '<label class="rpht_labels">Save Chatbox Inputs: </label><input style="width: 40px;" type="checkbox" id="chatTextboxSave" name="roomSessioning">' +
            '<br /><br />' +
            '<label class="rpht_labels">Save PM Inputs: </label><input style="width: 40px;" type="checkbox" id="pmTextboxSave" name="roomSessioning">' +
            '<br />' +
            '<label class="rpht_labels" style="font-size: 12px; text-align: left;">This may not restore the inputs correctly if you have a PM open, but not an active session with the person.' + 
            '<br />' +
            'e.g., you\'ve started a new PM, but did not send one yet.</label>' +
            '<br /><br />' +
            '<button style="margin-left: 310px;" type="button" id="resetSession">Reset Session</button>' +
            '</div><div>' +
            '<h4>Auto Joining</h4>' +
            '<label class="rpht_labels">Join favorites: </label><input style="width: 40px;" type="checkbox" id="favEnable" name="favEnable">' +
            '<br /><br />' +
            '<label class="rpht_labels">Restore last session: </label><input style="width: 40px;" type="checkbox" id="roomSessioning" name="roomSessioning">' +
            '<br /><br />' +
            '<label class="rpht_labels">Username: </label><select style="width: 300px;" id="favUserDropList"></select>' +
            '<br /><br />' +
            '<label class="rpht_labels">Room:  </label><input  type="text" id="favRoom" name="favRoom">' +
            '<br /><br />' +
            '<label class="rpht_labels">Password: </label><input  type="text" id="favRoomPw" name="favRoomPw">' +
            '<br /><br />' +
            '<button style="margin-left: 586px;" type="button" id="favAdd">Add</button>' +
            '<p>Favorite rooms</p>' +
            '<select style="width: 611px;" id="favRoomsList" size="10"></select><br><br>' +
            '<button style="margin-left: 560px;" type="button" id="favRemove">Remove</button>' +
            '<br>' +
            '</div>'
    };

    function init() {
        loadSettings();

        $('#dcRefresh').click(() => {
            sessionSettings.autoRefresh = getCheckBox('#dcRefresh');
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        $('#refreshTime').change(() => {
            sessionSettings.refreshSecs = $('#refreshTime').val();
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        $('#chatTextboxSave').click( () => {
            sessionSettings.chatTextboxSave = getCheckBox('#chatTextboxSave');
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        $('#pmTextboxSave').click( () => {
            sessionSettings.pmTextboxSave = getCheckBox('#pmTextboxSave');
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        $('#roomSessioning').click(() => {
            sessionSettings.joinSession = getCheckBox('#roomSessioning');
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        $('#favEnable').click(() => {
            sessionSettings.joinFavorites = getCheckBox('#favEnable');
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        $('#favAdd').click(() => {
            parseFavoriteRoom($('#favRoom').val());
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        $('#favRemove').click(() => {
            removeFavoriteRoom();
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        $('#resetSession').click(() => {
            clearRoomSession();
            settingsModule.saveSettings(localStorageName, sessionSettings);
        });

        if (determineAutojoin()) {
            autoJoinTimer = setInterval(autoJoiningHandler, AUTOJOIN_INTERVAL);
            sessionSettings.dcHappened = false;
            settingsModule.saveSettings(localStorageName, sessionSettings);
        } else {
            clearRoomSession();
        }

        setTimeout(() => {
            console.log('RPH Tools[connectionStabilityTimeout] - Connection considered stable');
            sessionSettings.autoRefreshAttempts = MAX_AUTO_REFRESH_ATTEMPTS;
            settingsModule.saveSettings(localStorageName, sessionSettings);
        }, REFRESH_ATTEMPTS_TIMEOUT);

        socket.on('restore-pms', () => {
            if (sessionSettings.pmTextboxSave){
                setTimeout(() => {
                    var pmTextBoxes = $("#pm-bottom .textarea textarea");
                    for (var i = 0; i < pmTextBoxes.length; i++){
                        console.log(sessionSettings.pmTextboxes[i]);
                        if (sessionSettings.pmTextboxes[i])
                            pmTextBoxes[i].value = sessionSettings.pmTextboxes[i];
                    }
                }, 1000);
            }
        });

        chatSocket.on('disconnect', () => {
            var chatTextBoxes = $("#chat-bottom .textarea textarea");
            var pmTextBoxes = $("#pm-bottom .textarea textarea");
            sessionSettings.chatTextboxes = [];
            sessionSettings.pmTextboxes = [];
            for (var i = 0; i < chatTextBoxes.length; i++){
                var textboxInfo = {
                    value: chatTextBoxes[i].value,
                    className: chatTextBoxes[i].className,
                }
                sessionSettings.chatTextboxes.push(textboxInfo);
            }

            for (var i = 0; i < pmTextBoxes.length; i++){
                sessionSettings.pmTextboxes.push(pmTextBoxes[i].value);
            }
            settingsModule.saveSettings(localStorageName, sessionSettings);

            if (sessionSettings.autoRefresh && sessionSettings.autoRefreshAttempts > 0) {
                setTimeout(() => {
                    sessionSettings.autoRefreshAttempts -= 1;
                    sessionSettings.dcHappened = true;
                    settingsModule.saveSettings(localStorageName, sessionSettings);
                    window.onbeforeunload = null;
                    window.location.reload(true);
                }, sessionSettings.refreshSecs * 1000);
            } else if (sessionSettings.autoRefresh) {
                $('<div id="rpht-max-refresh" class="inner">' +
                    '<p>Max auto refresh attempts tried. You will need to manually refresh.</p>' +
                    '</div>'
                ).dialog({
                    open: function (event, ui) {},
                    buttons: {
                        Cancel: () => {
                            $(this).dialog("close");
                        }
                    },
                }).dialog('open');
            }
        });

        socket.on('accounts', () => {
            setTimeout(() => {
                $('#favUserDropList').empty();
                var namesToIds = getSortedNames();
                for (var name in namesToIds) {
                    addToDroplist(namesToIds[name], name, "#favUserDropList");
                }
            }, 3000);
        });
    }

    /**
     * Determining auto-joining should be done
     * 1. Joining favorites & there are favorite rooms
     * 2. Join last session & there are rooms in the session
     * 3. Auto refresh & disconnect happened & there are refresh attempts left
     */
    function determineAutojoin() {
        var autoJoin = false;

        if (sessionSettings.joinFavorites === true &&
            sessionSettings.favRooms.length > 0) {
            autoJoin = true;
        }

        if (sessionSettings.joinSession === true &&
            sessionSettings.roomSession.length > 0) {
            sessionShadow.push(sessionSettings.roomSession);
            autoJoin = true;
        }

        if (sessionSettings.autoRefresh &&
            sessionSettings.dcHappened &&
            sessionSettings.autoRefreshAttempts > 0) {
            sessionShadow.push(sessionSettings.roomSession);
            autoJoin = true;
        }

        return autoJoin;
    }

    /**
     * Handler for the auto-joining mechanism.
     **/

    function autoJoiningHandler() {
        /* Don't run this if there's no rooms yet. */
        if (roomnames.length === 0) {
            return;
        }

        $('<div id="rpht-autojoin" class="inner">' +
            '<p>Autojoining or restoring session.</p>' +
            '<p>Press "Cancel" to stop autojoin or session restore.</p>' +
            '</div>'
        ).dialog({
            open: function (event, ui) {
                setTimeout(() => {
                    $('#rpht-autojoin').dialog('close');
                }, AUTOJOIN_TIMEOUT_SEC);
            },
            buttons: {
                Cancel: () => {
                    clearTimeout(autoJoinTimer);
                    $(this).dialog("close");
                }
            },
        }).dialog('open');

        clearTimeout(autoJoinTimer);
        autoJoinTimer = setTimeout(joinRooms, AUTOJOIN_TIMEOUT_SEC);
    };

    /**
     * Join rooms in the favorites and what was in the session.
     */
    function joinRooms() {
        if (sessionSettings.joinFavorites === true) {
            joinFavoriteRooms();
        }

        setTimeout(() => {
            if (sessionSettings.autoRefresh || sessionSettings.joinSession) {
                console.log('Joining sessioned rooms', sessionShadow);
                clearRoomSession();
                joinSessionedRooms();
            }
        }, 1000);
        clearTimeout(autoJoinTimer);
    }

    /**
     * Join rooms that were in the last session.
     */
    function joinSessionedRooms() {
        for (var i = 0; i < sessionShadow.length; i++) {
            var room = sessionShadow[i];
            var roomJoined = arrayObjectIndexOf(rph.roomsJoined, 'roomname', room.roomname) > -1;
            var userJoined = arrayObjectIndexOf(rph.roomsJoined, 'user', room.user) > -1;
            var alreadyInRoom = roomJoined && userJoined;
            if (!alreadyInRoom) {
                chatSocket.emit('join', {
                    name: room.roomname,
                    userid: room.user
                });
            }
        }

        delete sessionShadow;
        if (sessionSettings.chatTextboxSave){
            populateChatTextboxes();
        }
    }

    /** 
     * Joins all the rooms in the favorite rooms list
     */
    function joinFavoriteRooms() {
        for (var i = 0; i < sessionSettings.favRooms.length; i++) {
            var favRoom = sessionSettings.favRooms[i];
            chatSocket.emit('join', {
                name: favRoom.room,
                userid: favRoom.userId,
                pw: favRoom.roomPw
            });
        }

        if (sessionSettings.chatTextboxSave){
            populateChatTextboxes();
        }
    };

    function populateChatTextboxes () {
        setTimeout(() => {
            var chatTextBoxes = $("#chat-bottom .textarea textarea");
            for (var i = 0; i < chatTextBoxes.length; i++){
                var idx = arrayObjectIndexOf(sessionSettings.chatTextboxes, 'className', chatTextBoxes[i].className);
                if (idx > -1) {
                    chatTextBoxes[i].value = sessionSettings.chatTextboxes[idx].value;
                }
            }
        }, 250);
    }

    function addRoomToSession(roomname, userid) {
        var alreadyInSession = false
        var roomSession = sessionSettings.roomSession
        for (var i = 0; i < roomSession.length; i++) {
            var room = roomSession[i]
            if (room.roomname == roomname && room.user == userid) {
                alreadyInSession = true;
                break;
            }
        }

        if (!alreadyInSession) {
            console.log('RPH Tools[addRoomToSession]: Adding room to session:', roomname, userid);
            sessionSettings.roomSession.push({
                'roomname': roomname,
                'user': userid
            });
            settingsModule.saveSettings(localStorageName, sessionSettings);
        }
    };

    function removeRoomFromSession(roomname, userid) {
        var roomSession = sessionSettings.roomSession
        for (var i = 0; i < roomSession.length; i++) {
            var room = roomSession[i]
            if (room.roomname == roomname && room.user == userid) {
                console.log('RPH Tools[removeRoomFromSession]: Removing room -', room);
                sessionSettings.roomSession.splice(i, 1);
                settingsModule.saveSettings(localStorageName, sessionSettings);
            }
        }
    };

    /**
     * Clear the room session.
     */
    function clearRoomSession() {
        sessionSettings.roomSession = []
        settingsModule.saveSettings(localStorageName, sessionSettings);
    };

    /** 
     * Adds an entry to the Favorite Chat Rooms list from an input
     * @param {string} roomname - Name of the room
     */
    function parseFavoriteRoom(roomname) {
        var room = getRoom(roomname);

        if (room === undefined) {
            markProblem('favRoom', true);
            return;
        }

        if (sessionSettings.favRooms.length < MAX_ROOMS) {
            var selectedFav = $('#favUserDropList option:selected');
            var hashStr = $('#favRoom').val() + selectedFav.html();
            var favRoomObj = {
                _id: hashStr.hashCode(),
                user: selectedFav.html(),
                userId: parseInt(selectedFav.val()),
                room: $('#favRoom').val(),
                roomPw: $('#favRoomPw').val()
            };
            addFavoriteRoom(favRoomObj);
            markProblem('favRoom', false);
        }
    };

    /**
     * Adds a favorite room to the settings list
     * @param {Object} favRoomObj - Object containing the favorite room parameters.
     */
    function addFavoriteRoom(favRoomObj) {
        if (arrayObjectIndexOf(sessionSettings.favRooms, "_id", favRoomObj._id) === -1) {
            $('#favRoomsList').append(
                '<option value="' + favRoomObj._id + '">' +
                favRoomObj.user + ": " + favRoomObj.room + '</option>'
            );
            sessionSettings.favRooms.push(favRoomObj);
        }

        if (sessionSettings.favRooms.length >= MAX_ROOMS) {
            $('#favAdd').text("Favorites Full");
            $('#favAdd')[0].disabled = true;
        }
    };

    /** 
     * Removes an entry to the Favorite Chat Rooms list
     */
    function removeFavoriteRoom() {
        var favItem = document.getElementById("favRoomsList");
        var favItemId = $('#favRoomsList option:selected').val();
        favItem.remove(favItem.selectedIndex);

        for (var idx = 0; idx < sessionSettings.favRooms.length; idx++) {
            if (sessionSettings.favRooms[idx]._id == favItemId) {
                sessionSettings.favRooms.splice(idx, 1);
                break;
            }
        }

        if (sessionSettings.favRooms.length < 10) {
            $('#favAdd').text("Add");
            $('#favAdd')[0].disabled = false;
        }
    };

    function loadSettings() {
        var storedSettings = settingsModule.getSettings(localStorageName);

        if (storedSettings) {
            for (var key in storedSettings) {
                sessionSettings[key] = storedSettings[key];
            }
        }
        else {
            sessionSettings = {
                'autoRefreshAttempts': 5,
                'dcHappened': false,
                'autoRefresh': false,
                'refreshSecs': 15,
                'joinFavorites': false,
                'joinSession': false,
                'roomSession': [],
                'favRooms': [],
            };
        }

        $('#favRoomsList').empty();

        $('#dcRefresh').prop("checked", sessionSettings.autoRefresh);
        $('#refreshTime').val(sessionSettings.refreshSecs);
        $('#chatTextboxSave').prop("checked", sessionSettings.chatTextboxSave);
        $('#pmTextboxSave').prop("checked", sessionSettings.pmTextboxSave);
        $('input#favEnable').prop("checked", sessionSettings.joinFavorites);
        $('#roomSessioning').prop("checked", sessionSettings.joinSession);

        for (var i = 0; i < sessionSettings.favRooms.length; i++) {
            var favRoomObj = sessionSettings.favRooms[i];
            $('#favRoomsList').append(
                '<option value="' + favRoomObj._id + '">' +
                favRoomObj.user + ": " + favRoomObj.room + '</option>'
            );
        }

        if (sessionSettings.favRooms.length >= MAX_ROOMS) {
            $('#favAdd').text("Favorites Full");
            $('#favAdd')[0].disabled = true;
        }
    }

    function getHtml() {
        return html;
    }

    function toString() {
        return 'Session Module';
    }

    return {
        init: init,
        addRoomToSession: addRoomToSession,
        removeRoomFromSession: removeRoomFromSession,
        loadSettings: loadSettings,
        getHtml: getHtml,
        toString: toString
    };
}());/**
 * This module handles features for the PM system.
 */
var pmModule = (function () {
    var pmSettings = {
        'audioUrl': 'http://chat.rphaven.com/sounds/imsound.mp3',
        'pmMute': false,
    };

    var localStorageName = "rpht_PmModule";

    var html = {
        'tabId': 'pm-module',
        'tabName': 'PMs',
        'tabContents': '<h3>PM Settings</h3>' +
            '<div><h4>PM Away System</h4>' +
            '</p>' +
            '<p>Username</p>' +
            '<select style="width: 613px;" id="pmNamesDroplist" size="10"></select>' +
            '<br><br>' +
            '<label class="rpht_labels">Away Message: </label><input type="text" id="awayMessageTextbox" name="awayMessageTextbox" maxlength="300" placeholder="Away message...">' +
            '<br /><br />' +
            '<button style="margin-left: 483px; width:60px" "type="button" id="setAwayButton">Enable</button> <button type="button" style="margin-left: 6px; width:60px" id="removeAwayButton">Disable</button>' +
            '</div><div>' +
            '<h4>Other Settings</h4>' +
            '</p>' +
            '<label class="rpht_labels">PM Sound: </label><input type="text" id="pmPingURL" name="pmPingURL">' +
            '<br /><br />' +
            '<label class="rpht_labels">Mute PMs: </label><input style="width: 40px;" type="checkbox" id="pmMute" name="pmMute">'
    };

    var awayMessages = {};

    function init() {
        loadSettings();
        
        $('#pmNamesDroplist').change(() => {
            var userId = $('#pmNamesDroplist option:selected').val();
            var message = '';

            if (awayMessages[userId] !== undefined) {
                message = awayMessages[userId].message;
            }
            $('input#awayMessageTextbox').val(message);
        });

        $('#setAwayButton').click(() => {
            setPmAway();
        });

        $('#removeAwayButton').click(() => {
            removePmAway();
        });

        $('#pmPingURL').change(() => {
            if (validateSetting('pmPingURL', 'url')) {
                pmSettings.audioUrl = getInput('pmPingURL');
                $('#im-sound').children("audio").attr('src', pmSettings.audioUrl);
                settingsModule.saveSettings(localStorageName, pmSettings);
            }
        });

        $('#pmMute').change(() => {
            if ($('#pmMute').is(":checked")) {
                $('#im-sound').children("audio").attr('src', '');
                pmSettings.pmMute = true;
            } else {
                $('#im-sound').children("audio").attr('src', pmSettings.audioUrl);
                pmSettings.pmMute = false;
            }
            settingsModule.saveSettings(localStorageName, pmSettings);
        });

        socket.on('pm', function (data) {
            handleIncomingPm(data);
        });

        socket.on('outgoing-pm', function (data) {
            handleOutgoingPm(data);
        });

        socket.on('accounts', () => {
            setTimeout(() => {
                $('#pmNamesDroplist').empty();
                var namesToIds = getSortedNames();
                for (var name in namesToIds) {
                    addToDroplist(namesToIds[name], name, "#pmNamesDroplist");
                }
            }, 3000);
        });
    }

    /**
     * Handler for PMs that are incoming
     * @param {object } data Data containing the PM.
     */
    function handleIncomingPm(data) {
        if (!awayMessages[data.from]) {
            return;
        }

        if (awayMessages[data.from].enabled) {
            awayMessages[data.from].usedPmAwayMsg = true;
            socket.emit('pm', {
                'from': data.from,
                'to': data.to,
                'msg': awayMessages[data.from].message,
                'target': 'all'
            });
        }
    }

    /**
     * Handler for PMs that are outgoing
     * @param {object } data Data containing the PM.
     */
    function handleOutgoingPm(data) {
        if (!awayMessages[data.from]) {
            return;
        }

        if (!awayMessages[data.from].usedPmAwayMsg) {
            awayMessages[data.from].enabled = false;
            $('#pmNamesDroplist option').filter(function () {
                return this.value == data.from;
            }).css("background-color", "");
        }
        awayMessages[data.from].usedPmAwayMsg = false;
    }

    /**
     * Adds an away status to a character
     */
    function setPmAway() {
        var userId = $('#pmNamesDroplist option:selected').val();
        var name = $("#pmNamesDroplist option:selected").html();
        if (!awayMessages[userId]) {
            var awayMsgObj = {
                "usedPmAwayMsg": false,
                "message": "",
                "enabled": false
            };
            awayMessages[userId] = awayMsgObj;
        }

        if (!awayMessages[userId].enabled) {
            $("#pmNamesDroplist option:selected").html("[Away]" + name);
        }
        awayMessages[userId].enabled = true;
        awayMessages[userId].message = $('input#awayMessageTextbox').val();
        $("#pmNamesDroplist option:selected").css("background-color", "#FFD800");
        $("#pmNamesDroplist option:selected").prop("selected", false);

        console.log('RPH Tools[setPmAway]: Setting away message for',
            name, 'with message', awayMessages[userId].message);
    };

    /**
     * Removes an away status for a character
     */
    function removePmAway() {
        var userId = $('#pmNamesDroplist option:selected').val();

        if (!awayMessages[userId]) {
            return;
        }

        if (awayMessages[userId].enabled) {
            var name = $("#pmNamesDroplist option:selected").html();
            awayMessages[userId].enabled = false;
            $("#pmNamesDroplist option:selected").html(name.substring(6, name.length));
            $("#pmNamesDroplist option:selected").css("background-color", "");
            $('input#awayMessageTextbox').val("");
            console.log('RPH Tools[removePmAway]: Remove away message for', name);
        }
    };

    function loadSettings() {
        var storedSettings = settingsModule.getSettings(localStorageName);
        if (storedSettings) {
            pmSettings = storedSettings;
        } 
        else {
            pmSettings = {
                'audioUrl': 'http://chat.rphaven.com/sounds/imsound.mp3',
                'pmMute': false,
            };
        }
        $('#pmPingURL').val(pmSettings.audioUrl);
        $('#pmMute').prop("checked", pmSettings.pmMute);
    }

    function getHtml() {
        return html;
    }

    function toString() {
        return 'PM Module';
    }

    return {
        init: init,
        loadSettings: loadSettings,
        getHtml: getHtml,
        toString: toString
    };
}());/** 
 * Random number generator module. This is mostly used for chance games that
 * can happen in the chat
 */
var rngModule = (function () {
    var DIE_MIN = 1;
    var DIE_MAX = 100;
    var DIE_SIDE_MIN = 2;
    var DIE_SIDE_MAX = 100;
    var RNG_NUM_MIN = -10000000000000;
    var RNG_NUM_MAX = 10000000000000;

    var html = {
        'tabId': 'rng-module',
        'tabName': 'Random Numbers',
        'tabContents': '<h3>Random Number Generators</h3>' +
            '<div>' +
            '<h4>Shortcuts</h4><br />' +
            '<p><span style="font-family: courier">/coinflip</span> - Does a coin toss</p>' +
            '<p><span style="font-family: courier">/roll [num]d[num]</span> - Dice roll. ' + 
            'If no argument is given, it rolls 1d1000. Example: <span style="font-family: courier">/roll 2d6</span> will roll 2 dices with 6 sides</p>' +
            '</div>' +
            '<div id="coinFlipOptions">' +
            '<h4>Coin toss</h4><br />' +
            '<button style="margin-left: 312px;" type="button" id="coinRngButton">Flip a coin!</button>' +
            '</div>' +
            '<div id="diceOptions">' +
            '<h4>Dice roll</h4><br />' +
            '<label class="rpht_labels">Number of die </label><input style="width: 300px;" type="number" id="diceNum" name="diceNum" max="100" min="1" value="2">' +
            '<br /><br />' +
            '<label  class="rpht_labels">Sides </label><input style="width: 300px;" type="number" id="diceSides" name="diceSides" max="1000" min="2" value="6">' +
            '<br /><br />' +
            '<label class="rpht_labels">Show Totals:</label><input style="width: 20px;" type="checkbox" id="showRollTotals" name="showRollTotals">' +
            '<br /><br />' +
            '<button style="margin-left: 312px;" type="button" id="diceRngButton">Let\'s roll!</button>' +
            '</div>' +
            '<div id="rngOptions">' +
            '<h4>General RNG</h4><br />' +
            '<label  class="rpht_labels">Minimum: </label><input style="width: 300px;" type="number" id="rngMinNumber" name="rngMinNumber" max="4294967295" min="-4294967296" value="0">' +
            '<br /><br />' +
            '<label  class="rpht_labels">Maximum: </label><input style="width: 300px;" type="number" id="rngMaxNumber" name="rngMaxNumber" max="4294967295" min="-4294967296" value="10">' +
            '<br /><br />' +
            '<button style="margin-left: 312px;" type="button" id="randomRngButton">Randomize!</button>' +
            '</div>'
    };

    /** 
     * Initializes the GUI components of the module.
     */
    function init() {
        $('#diceNum').blur(function () {
            var dieNum = parseInt($('#diceNum').val());
            if (dieNum < DIE_MIN) {
                $('#diceNum').val(DIE_MIN);
            } else if (DIE_MAX < dieNum) {
                $('#diceNum').val(DIE_MAX);
            }
        });

        $('#diceSides').blur(function () {
            var dieSides = parseInt($('#diceSides').val());
            if (dieSides < DIE_SIDE_MIN) {
                $('#diceSides').val(DIE_SIDE_MIN);
            } else if (DIE_SIDE_MAX < dieSides) {
                $('#diceSides').val(DIE_SIDE_MAX);
            }
        });

        $('#rngMinNumber').blur(function () {
            var minNum = parseInt($('#rngMinNumber').val());
            if (minNum < RNG_NUM_MIN) {
                $('#rngMinNumber').val(RNG_NUM_MIN);
            } else if (RNG_NUM_MAX < minNum) {
                $('#rngMinNumber').val(RNG_NUM_MAX);
            }
        });

        $('#rngMaxNumber').blur(function () {
            var maxNum = parseInt($('#rngMaxNumber').val());
            if (maxNum < RNG_NUM_MIN) {
                $('#rngMaxNumber').val(RNG_NUM_MIN);
            } else if (RNG_NUM_MAX < maxNum) {
                $('#rngMaxNumber').val(RNG_NUM_MAX);
            }
        });

        $('#coinRngButton').click(function () {
            sendResult(genCoinFlip());
        });

        $('#diceRngButton').click(function () {
            var dieNum = parseInt($('#diceNum').val());
            var dieSides = parseInt($('#diceSides').val());
            var showTotals = getCheckBox('#showRollTotals');
            sendResult(getDiceRoll(dieNum, dieSides, showTotals));
        });

        $('#randomRngButton').click(function () {
            var minNum = parseInt($('#rngMinNumber').val());
            var maxNum = parseInt($('#rngMaxNumber').val());
            sendResult(genRandomNum(minNum, maxNum));
        });
    }

    /** 
     * Generates a coin flip
     * @returns String contaning the coin flip results.
     */
    function genCoinFlip() {
        var coinMsg = '(( Coin toss: ';
        if (Math.ceil(Math.random() * 2) == 2) {
            coinMsg += 'heads!))';
        } else {
            coinMsg += 'tails!))';
        }

        return attachIntegrity(coinMsg);
    };

    /**
     * Genreates a dice roll
     * @param {number} dieNum Number of die to use
     * @param {number} dieSides Number of sides per die
     * @param {boolean} showTotals Flag to show the total value of the roll
     * @returns String containing the dice roll result
     */
    function getDiceRoll(dieNum, dieSides, showTotals) {
        /* Cap the values, just in case. */
        dieNum = (dieNum > DIE_MAX) ? DIE_MAX : dieNum;
        dieNum = (dieNum < DIE_MIN) ? DIE_MIN : dieNum;
        dieSides = (dieSides > DIE_SIDE_MAX) ? DIE_SIDE_MAX : dieSides;
        dieSides = (dieSides < DIE_SIDE_MIN) ? DIE_SIDE_MIN : dieSides;

        var totals = 0;
        var dieMsg = '/me rolled ' + dieNum + 'd' + dieSides + ':';

        for (i = 0; i < dieNum; i++) {
            var result = Math.ceil(Math.random() * dieSides);
            if (showTotals) {
                totals += result;
            }
            dieMsg += ' ';
            dieMsg += result;
        }
        if (showTotals) {
            dieMsg += " (Total amount: " + totals + ")";
        }
        return attachIntegrity(dieMsg);
    };

    /**
     * Generates a random number between a min and max
     * @param {number} minNum Minimum end of the range
     * @param {number} maxNum Maximum end of the range
     * @returns String containing the random number result.
     */
    function genRandomNum(minNum, maxNum) {
        var ranNumMsg = '(( Random number generated (' + minNum + ' to ' +
            maxNum + '): ';
        ranNumMsg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) +
            ' ))';
        return attachIntegrity(ranNumMsg);
    };

    /**
     * Sends the result of a random number generated to the server
     * @param {string} outcomeMsg A built string to show up on the chat.
     */
    function sendResult(outcomeMsg) {
        var class_name = $('li.active')[0].className.split(" ");
        var room_name = "";
        var this_room = null;
        var userID = parseInt(class_name[2].substring(0, 6));
        var chatModule = rphToolsModule.getModule('Chat Module');
        

        /* Populate room name based on if showing usernames is checked. */
        if (chatModule) {
            room_name = $('li.active').find("span:first").text();
        } else {
            room_name = $('li.active')[0].textContent.slice(0, -1);
        }

        this_room = getRoom(room_name);
        this_room.sendMessage(outcomeMsg, userID);
    };

    function attachIntegrity (outcomeMsg) {
        var outcomeHash = outcomeMsg.hashCode();
        outcomeMsg += '\u200b' + outcomeHash;
        return outcomeMsg;
    }

    
    function getHtml() {
        return html;
    };

    function toString() {
        return 'RNG Module';
    };

    /**
     * Public members of the module exposed to others.
     */
    return {
        init: init,
        genCoinFlip: genCoinFlip,
        getDiceRoll: getDiceRoll,
        getHtml: getHtml,
        toString: toString
    };
}());/**
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
}());/**
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
}());/**
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
}());/**
 * This module handles the "About" section for information on RPH Tools.
 */
var aboutModule = (function () {
    var html = {
        'tabId': 'about-module',
        'tabName': 'About',
        'tabContents': '<h3>RPH Tools</h3>' +
            '<p><strong>Version: ' + VERSION_STRING + '</strong>' +
            ' | <a href="https://github.com/shuffyiosys/rph-tools/blob/master/CHANGELOG.md" target="_blank">Version history</a>' +
            ' | <a href="https://openuserjs.org/install/shuffyiosys/RPH_Tools.user.js" target="_blank">Install the latest version</a>' +
            '</p></br>' +
            '<p>Created by shuffyiosys. Under MIT License (SPDX: MIT). Feel free to make contributions to <a href="https://github.com/shuffyiosys/rph-tools" target="_blank">the repo</a>!</p><br />' +
            '<p><a href="https://github.com/shuffyiosys/rph-tools/blob/master/docs/quick-guide.md" target="_blank">Quick guide to using RPH Tools</a></p></br>' +
            '<p>If the script isn\'t working, try some <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target="_blank">Troubleshooting Tips</a></p><br />'
    };

    function init() {
        return;
    }

    function getHtml() {
        return html;
    }

    function toString() {
        return 'About Module';
    }

    return {
        init: init,
        getHtml: getHtml,
        toString: toString
    };
}());/**
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
}());/****************************************************************************
 * Script initializations to execute after the page loads
 ***************************************************************************/
$(function () {
    console.log('RPH Tools', VERSION_STRING, 'start');
    var modules = [
        chatModule,
        sessionModule,
        pmModule,
        rngModule,
        blockingModule,
        moddingModule,
        settingsModule,
        aboutModule,
    ];

    rphToolsModule.init(modules);
    console.log('RPH Tools initialization complete');
});