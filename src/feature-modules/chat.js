/****
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
            '<p>Use <a href="https://htmlcolorcodes.com/color-picker/" target="_blank">this color picker</a> if you need to find the right hex code.</p>'+
            '<p><strong>Shortcut:</strong> /color [HTML color] - Changes the text color of the current username</p>' +
            '<br /><br />' +
            '<label class="rpht_labels">Username:</label><select  style="width: 300px;" id="userColorDroplist"></select>' +
            '<br /><br />' +
            '<label class="rpht_labels">Text color:</label><input style="width: 300px;" type="text" id="userNameTextColor" name="userNameTextColor" value="111">' +
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

        $('#userColorDroplist').change(() => {
            var userId = $('#userColorDroplist option:selected').val();
            getUserById(userId, (user) => { 
                $('#userNameTextColor').val(user.props.color);
                $('#colorPreview').css('color', '#' + user.props.color);
            });
        });

        $('#userNameTextColorButton').click(function () {
            if (validateSetting('input#userNameTextColor', 'color') === true) {
                var userId = $('#userColorDroplist option:selected').val();
                var textColor = getInput('input#userNameTextColor').replace('#', '');
                getUserById(userId, (user) => {
                    socket.emit('modify', {
                        userid: user.props.id,
                        color: textColor
                    });
                })
            }
        });

        $('#userNameTextColor').change(function () {
            if (validateSetting('input#userNameTextColor', 'color')) {
                var inputText = getInput('#userNameTextColor');
                if (inputText[0] != '#'){
                    inputText = '#' + inputText;
                }
                $('#colorPreview').css('color', inputText);
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
            if (validateSetting('#pingTextColor', 'color-allrange') === true) {
                pingSettings.color = getInput('#pingTextColor');
                saveSettings();
                markProblem('#pingHighlightColor', false);
            } else {
                markProblem('#pingHighlightColor', true);
            }
        });

        $('#pingHighlightColor').blur(function () {
            if (validateSetting('#pingHighlightColor', 'color-allrange') === true) {
                pingSettings.highlight = getInput('#pingHighlightColor');
                saveSettings();
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
                getUserById($('#userColorDroplist option:selected').val(), (user) => { 
                    $('#userNameTextColor').val(user.props.color);
                });
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
            chatTextArea.bind('keydown', function (ev) {
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
        var timestamp = makeTimestamp(false, true);
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
            msg = parseMsg(parseRng(data))
            msg += ' <span style="background:#4A4; color: #FFF;"> &#9745; </span>';

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
     * Parses a RNG message to take what the client sent and seed it into an
     * RNG.
     * @param {*} message - Message from the sender.
     */
    function parseRng(data) {
        let newMsg = "";
        let message = data.msg.substring(0, data.msg.indexOf('\u200b'));;
        if (message.match(new RegExp(/coin/, 'gi'))){
            let result = 0;
            newMsg = "/me flips a coin. It lands on... ";
            if (message.match(new RegExp(/heads/, 'gi'))) {
                result = LcgRng(1 + data.time)
            }
            else {
                result = LcgRng(1 + data.time)
            }

            if (result % 2 === 1) {
                newMsg += "heads!"
            }
            else {
                newMsg += "tails!"
            }
        }
        else if (message.match(new RegExp(/rolled/, 'gi'))){
            let resultStartIdx = message.indexOf(':')
            let submsg = message.substring(resultStartIdx, message.length)
            let numberMatches = submsg.match(new RegExp(/[0-9]+/, 'gi'))
            let dieSides = message.match(new RegExp(/[0-9]+d[0-9]+/, 'gi'))
            let sides = dieSides[0].split('d')[1]
            let results = []
            let total = 0

            numberMatches.forEach((number) => {
                let seed = (parseInt(number) + data.time) % Math.pow(2, 32)
                results.push(LcgRng(seed) % sides + 1)
            })
            
            total = results.reduce((a, b) => a + b, 0)
            newMsg = message.substring(0, resultStartIdx) + ': '
            newMsg += results.join(' ')
            newMsg += ' (total ' + total + ')'
        }
        else if (message.match(new RegExp(/generated/, 'gi'))){
            let resultStartIdx = message.indexOf(':')
            let submsg = message.substring(resultStartIdx, message.length)
            let numberMatch = submsg.match(new RegExp(/[0-9]+/, 'gi'))
            let upperLim = message.match(new RegExp(/to [0-9]+/, 'gi'))[0].split(' ')[1]
            let seed = parseInt(numberMatch[0]) + data.time
            newMsg = message.substring(0, resultStartIdx)
            newMsg += ': ' + LcgRng(parseInt(seed)) % upperLim + ' ))'
        }
        return newMsg;
    }

    /**
     * Generates a randum number using the Linear congruential generator algorithm
     * @param {*} value - Number that seeds the RNG
     */
    function LcgRng (value) {
        let result = (((value * 214013) % Math.pow(2,32) + 2531011) % Math.pow(2,32))
        return result
    }

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
                if (cmdArgs.length != 3) {
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
                if (cmdArgs.length != 3) {
                    error = true;
                }
                else {
                    var colorArg = cmdArgs[1].replace('#', '');
                    if (validateColor(colorArg) && validateColorRange(colorArg)) {
                        socket.emit('modify', {
                            userid: User.props.id,
                            color: colorArg
                        });
                        inputTextBox.css('color', cmdArgs[1].replace('#', ''));
                    }
                    else {
                        error = true;
                    }
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
                    var sides = 20;

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
            case '/random':
                var rngModule = rphToolsModule.getModule('RNG Module');
                if (rngModule) {
                    inputTextBox.val(rngModule.genRandomNum());
                    sendChatMessage(inputTextBox, Room, User);
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
}());