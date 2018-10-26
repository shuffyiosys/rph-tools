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

    var chatSettings = {
        'filterFlood': true,
        'spamThreshold': 1000,
    };

    var localStorageName = "rpht_ChatModule";

    var pingSound = null;

    var autoDismissTimer = null;

    var spamFilter = {};

    var spamLenModifier = 3;

    var spamBufPadding = 250;

    var filterSuppressTimer = null;

    var filterSuppressed = false;

    var FILTER_SUPPRESS_TIME = 2000;

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
            '</div><div>' +
            '<h4>Flood Filtering</h4>' +
            '<label class="rpht_labels">Filter flooding </label><input style="width: 40px;" type="checkbox" id="filterFlood" name="filterFlood">' +
            '<br /><br />' +
            '<label class="rpht_labels">Filter Strength:</label><select  style="width: 300px;" id="filterStrengthDroplist"></select>' +
            '<br /><br />' +
            '<button style="margin-left: 546px;" type="button" id="resetFilters">Reset filter</button>' +
            '</div>'
    }

    var init = function () {
        rphToolsModule.registerDroplist($('#userColorDroplist'));
        loadSettings(JSON.parse(localStorage.getItem(localStorageName)));

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

        $('#showUsername').change(function () {
            pingSettings.case = getCheckBox('#pingCaseSense');
            saveSettings();
        });

        $('#filterFlood').change(function () {
            chatSettings.filterFlood = getCheckBox('#filterFlood');
            saveSettings();
        });

        /* Setting up the filter droplist. */
        addToDroplist(800, 'Strongest', $('#filterStrengthDroplist'));
        addToDroplist(1000, 'Stronger', $('#filterStrengthDroplist'));
        addToDroplist(1250, 'Strong', $('#filterStrengthDroplist'));
        addToDroplist(1500, 'Normal', $('#filterStrengthDroplist'));
        addToDroplist(1750, 'Default (RPH)', $('#filterStrengthDroplist'));
        $('#filterStrengthDroplist').val(1000);

        $('#filterStrengthDroplist').change(function () {
            chatSettings.spamThreshold = $('#filterStrengthDroplist option:selected').val();
            saveSettings();
        });

        $('#resetFilters').click(function () {
            spamFilter = {};
        });

        $(window).resize(resizeChatTabs);

        chatSocket.on('confirm-room-join', function (data) {
            roomSetup(data);
        });

        chatSocket.on('room-users-leave', function (data) {
            handleRoomLeave(data);
        });

        /* Setup the timer for automatically dismissing the opening dialog once
           rooms are available. The timer clears after. */
        autoDismissTimer = setInterval(function () {
            if (roomnames.length === 0) {
                return;
            }
            $("button span:contains('Continue')").trigger('click');
            clearTimeout(autoDismissTimer);
        }, 1000);
    }

    /**
     * When user joins a room, do the following:
     * - Set up the .onMessage function for pinging
     * - Add the user's name to the chat tab and textarea
     * - Create a room-pair name for the Modding section
     * - Add the room the session.
     * @param {object} room Room that the user has joined
     */
    var roomSetup = function (room) {
        var thisRoom = getRoom(room.room);
        var userId = getIdFromChatTab(thisRoom);
        var moddingModule = rphToolsModule.getModule('Modding Module');
        var sessionModule = rphToolsModule.getModule('Session Module');

        if (filterSuppressed === true) {
            clearTimeout(filterSuppressTimer);
        }

        filterSuppressTimer = setTimeout(function () {
            filterSuppressed = false;
        }, FILTER_SUPPRESS_TIME);
        filterSuppressed = true;

        spamFilter[room.room] = {};

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
     * Handle actions needed when a user leaves a room.
     * @param {Object} data - Data blob containing room info.
     */
    var handleRoomLeave = function (data) {
        data.users.forEach(function (userId) {
            if (account.userids.indexOf(userId) > -1) {
                var sessionModule = rphToolsModule.getModule('Session Module');
                if (sessionModule !== null) {
                    sessionModule.removeRoomFromSession(data.room, userId);
                }
            }
        });
    }

    /**
     * Takes a message received in the chat and processes it for pinging or 
     * otherwise
     * @param {object} thisRoom The room that the message is for.
     * @param {object} data The message for the room
     */
    var postMessage = function (thisRoom, data, User) {
        var timestamp = makeFullTimeStamp();
        var msg = parseMsg(data.msg);
        var classes = '';
        var $el = '';
        var msgHtml = '';
        var ownMessage = account.userids.includes(User.props.id);
        var filterMsgFlag = false;

        /* Process only if not own message */
        if (ownMessage === false) {
            var moddingModule = rphToolsModule.getModule('Modding Module');

            /* Check if needs filtering */
            filterMsgFlag = processMsgFitler(thisRoom, data, User);

            /* Perform mod actions */
            if (moddingModule !== null && isModOfRoom(thisRoom)) {
                var modSettings = moddingModule.getSettings();
                var modName = getModForRoom(thisRoom);
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
                if (modSettings.kickWords) {
                    var kickRegex = new RegExp(modSettings.kickWords, 'gi');
                    if (msg.match(kickRegex)) {
                        moddingModule.processFilterAction('kick', modName, User.props.name, thisRoom.props.name);
                    }
                }
                if (modSettings.banWords) {
                    var banRegex = new RegExp(modSettings.banWords, 'gi');
                    if (msg.match(banRegex)) {
                        moddingModule.processFilterAction('ban', modName, User.props.name, thisRoom.props.name);
                    }
                }
                if (filterMsgFlag) {
                    moddingModule.processFlooding(modName, User.props.name, thisRoom.props.name);
                }
            }
        }

        if (filterMsgFlag === true) {
            return;
        }

        classes = getClasses(User, thisRoom);

        /* Check if this is a valid RNG */
        if (msg[msg.length - 1] === '\u200b') {
            msg += '&nbsp;<span style="background:#4A4; color: #000;">&#9745;</span>';
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

    var processMsgFitler = function (thisRoom, data, User) {
        var filterMsg = false;
        /* Exit if the following is true: filter is not on, filter is being suppressed*/
        if (chatSettings.filterFlood === false ||
            filterSuppressed === true) {
            return filterMsg;
        }

        if (User.blocked) {
            filterMsg = true;
        } else if (filterSpam(thisRoom, data, User)) {
            filterMsg = true;
        }

        return filterMsg;
    }

    var filterSpam = function (thisRoom, data, user) {
        var roomName = thisRoom.props.name;
        var msgAuthor = user.props.name;
        var filterMsg = false;

        if (!spamFilter[roomName]) {
            spamFilter[roomName] = {};
        }

        if (!spamFilter[roomName][msgAuthor]) {
            spamFilter[roomName][msgAuthor] = {};
            spamFilter[roomName][msgAuthor].bufferLength = 0;
            spamFilter[roomName][msgAuthor].lastTime = 0;
            spamFilter[roomName][msgAuthor].offenses = 0;
        }

        var tempBufferLength = spamFilter[roomName][msgAuthor].bufferLength;
        var tempLastTime = spamFilter[roomName][msgAuthor].lastTime;
        var curTime = Math.round(new Date().getTime() / 1000);
        if (data.msg.match(/\n/gi)) {
            data.msg.length = data.msg.length + (data.msg.match(/\n/gi).length * 250);
        }
        tempBufferLength = (tempBufferLength / (curTime - tempLastTime + 1)) + ((data.msg.length + tempBufferLength) / spamLenModifier) + spamBufPadding;
        tempLastTime = curTime;
        if (tempBufferLength > chatSettings.spamThreshold) {
            spamFilter[roomName][msgAuthor].offenses += 1;
            if (spamFilter[roomName][msgAuthor].offenses > 1) {
                console.log('Spam filter triggered:', roomName, msgAuthor, data.msg);
                filterMsg = true;
            }
        } else {
            spamFilter[roomName][msgAuthor].offenses = 0;
        }

        spamFilter[roomName][msgAuthor].bufferLength = tempBufferLength;
        spamFilter[roomName][msgAuthor].lastTime = tempLastTime;

        return filterMsg;
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
            case '/coinflip':
                var rngModule = rphToolsModule.getModule('RNG Module');
                if (rngModule) {
                    inputTextBox.val(rngModule.genCoinFlip() + '\u200b');
                    sendChatMessage(inputTextBox, Room, User);
                }
                break;
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
                        inputTextBox.val(rngModule.getDiceRoll(die, sides, true) + '\u200b');
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
            case '/russian':
                if (Math.floor(Math.random() * 6 + 1) == 1) {
                    inputTextBox.val('/me played Russian Roulette and... *BLAM* ...lost D:')
                    sendChatMessage(inputTextBox, Room, User);
                    chatSocket.disconnect();
                } else {
                    inputTextBox.val('/me played Russian Roulette and... *click* ...won :D')
                    sendChatMessage(inputTextBox, Room, User);
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
     * Gets the user name's classes that are applicable to it
     * @param {object} User - User of the message
     * @param {object} thisRoom - Room that the message is being sent to
     * @returns All the classes found
     */
    var getClasses = function (User, thisRoom) {
        var classes = '';
        if (User.friendOf) {
            classes += 'friend ';
        }
        if (isOwnUser(User)) {
            classes += 'self ';
        }
        if (isOwnerOf(thisRoom, User)) {
            classes += 'owner ';
        } else if (isModOf(thisRoom, User)) {
            classes += 'mod ';
        }
        if (isInGroup(thisRoom, User)) {
            classes += 'group-member ';
        }

        return classes;
    };

    /**
     * Checks if the message has any ping terms
     * @param {string} msg - The message for the chat
     * @returns Returns the match or null
     */
    var matchPing = function (msg, triggers, caseSensitive, exactMatch) {
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
    var highlightPing = function (msg, testRegex, color, highlight, bold, italicize) {
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
    var highlightRoom = function (thisRoom, color, highlight) {
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
    var addNameToUI = function (thisRoom, User) {
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
    var getIdFromChatTab = function (thisRoom) {
        var tabsLen = thisRoom.$tabs.length;
        var className = thisRoom.$tabs[tabsLen - 1][0].className;
        var charID = className.match(new RegExp(' [0-9]+', ''))[0];
        charID = charID.substring(1, charID.length);
        return parseInt(charID);
    };

    /**
     * Resizes chat tabs based on the width of the tabs vs. the screen size.
     */
    var resizeChatTabs = function () {
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
        setTimeout(enableResizing, (100));
    };

    var enableResizing = function () {
        $(window).resize(resizeChatTabs);
    };

    /**
     * Handlers for text color changing
     */
    var changeTextColor = function () {
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

    /*
     * Handlers for saving, loading, and populating data for the module.
     **/

    /**
     * Save current settings
     */
    var saveSettings = function () {
        localStorage.setItem(localStorageName, JSON.stringify(getSettings()));
    };

    var getSettings = function () {
        return {
            'chatSettings': chatSettings,
            'pingSettings': pingSettings
        };
    };

    /**
     * Loads settings from local storage
     * @param {object} storedSettings Object containing the settings
     */
    var loadSettings = function (storedSettings) {
        if (storedSettings !== null) {
            chatSettings = storedSettings.chatSettings;
            pingSettings = storedSettings.pingSettings;
        }
        populateSettings();
    };

    /**
     * Deletes the current settings and resets them to defaults.
     */
    var deleteSettings = function () {
        localStorage.removeItem(localStorageName);
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

        chatSettings = {
            'filterFlood': true,
            'spamThreshold': 1000,
        };

        populateSettings();
    };

    /**
     * Populate the GUI with settings from the browser's local storage
     */
    var populateSettings = function () {
        $('#pingNames').val(pingSettings.triggers);
        $('#pingURL').val(pingSettings.audioUrl);
        $('#pingTextColor').val(pingSettings.color);
        $('#pingHighlightColor').val(pingSettings.highlight);
        $('input#pingBoldEnable').prop("checked", pingSettings.bold);
        $('input#pingItalicsEnable').prop("checked", pingSettings.italics);
        $('input#pingExactMatch').prop("checked", pingSettings.exact);
        $('input#pingCaseSense').prop("checked", pingSettings.case);

        $('#filterFlood').prop("checked", chatSettings.filterFlood);
        $('#spamThresh').val(chatSettings.spamThreshold);
        pingSound = new Audio(pingSettings.audioUrl);
    };

    return {
        init: init,
        parseSlashCommand: parseSlashCommand,
        getSettings: getSettings,
        loadSettings: loadSettings,
        deleteSettings: deleteSettings,

        getHtml: function () {
            return html;
        },
        toString: function () {
            return 'Chat Module';
        },

    };
}());