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
    'showNames': true,
    'noIcons': false,
    'canCancel': false,
    'autoJoin': false,
    'session': false,
    'roomSession': [],
    'favRooms': [],
  };

  var localStorageName = "rpht_ChatModule";

  var pingSound = null;

  var autoJoinTimer = null;

  var updateSessionTimer = null;

  var waitForDialog = true;

  var userColorDroplist = null;

  var favUserDropList = null;

  var MAX_ROOMS = 30;

  var AUTOJOIN_TIMEOUT_SECS = 5;

  var html = {
    'tabId': 'chat-module',
    'tabName': 'Chat',
    'tabContents': '<h3>Chat room settings</h3>' +
      '<div>' +
      '<h4>User text color</h4>' +
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
      '<h4>Auto Joining</h4>' +
      '</p>' +
      '<label class="rpht_labels">Can Cancel: </label><input style="width: 40px;" type="checkbox" id="canCancelJoining" name="canCancelJoining" checked>' +
      '<br /><br />' +
      '<label class="rpht_labels">Room Sessioning: </label><input style="width: 40px;" type="checkbox" id="roomSessioning" name="roomSessioning">' +
      '<br /><br />' +
      '<label class="rpht_labels">Join favorites: </label><input style="width: 40px;" type="checkbox" id="favEnable" name="favEnable">' +
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
      '</div><div>' +
      '<h4>Other Settings</h4>' +
      '<label class="rpht_labels">No image icons</label><input style="width: 40px;" type="checkbox" id="imgIconDisable" name="imgIconDisable">' +
      '<br /><br />' +
      '<label class="rpht_labels">Show username in tabs & textbox (requires rejoin)</label><input style="width: 40px;" type="checkbox" id="showUsername" name="showUsername">' +
      '</div>' +
      '<br /><br />' +
      '<p>If you\'re here, you need to scroll up or switch to another setting category to find the close button.</p>'
  }

  var init = function () {
    var autoJoining = false;
    var hasRooms = false;

    userColorDroplist = $('#userColorDroplist');
    favUserDropList = $('#favUserDropList');

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
        pingSettings.exact);;
      if (testRegex !== null) {
        msg = highlightPing(msg, testRegex, pingSettings.color,
          pingSettings.highlight, pingSettings.bold,
          pingSettings.italics);
        if (pingSound !== null) {
          pingSound.play();
        }
        $('#pingPreviewText')[0].innerHTML = msg;
      } else {
        $('#pingPreviewText')[0].innerHTML = "No match";
      }
    });

    $('#showUsername').change(function () {
      chatSettings.showNames = getCheckBox('#showUsername');
      saveSettings();
    });

    $('#imgIconDisable').change(function () {
      chatSettings.noIcons = getCheckBox('#imgIconDisable');
      saveSettings();
    });

    $('#favEnable').click(function () {
      chatSettings.autoJoin = getCheckBox('#favEnable');
      saveSettings();
    });

    $('#roomSessioning').click(function () {
      chatSettings.session = getCheckBox('#roomSessioning');

      if (chatSettings.session) {
        updateSessionTimer = setInterval(updateSession, 30 * 1000);
      } else {
        clearTimeout(updateSessionTimer);
      }
      saveSettings();
    });

    $('#canCancelJoining').click(function () {
      chatSettings.canCancel = getCheckBox('#canCancelJoining');
      saveSettings();
    });

    $('#favAdd').click(function () {
      addFavoriteRoom();
      saveSettings();
    });

    $('#favRemove').click(function () {
      removeFavoriteRoom();
      saveSettings();
    });

    $(window).resize(resizeChatTabs);

    loadSettings(JSON.parse(localStorage.getItem(localStorageName)));

    chatSocket.on('confirm-room-join', function (data) {
      roomSetup(data);
    });

    autoJoining = (chatSettings.autoJoin || chatSettings.session);
    hasRooms = (chatSettings.favRooms.length > 0 || chatSettings.roomSession.length > 0);
    if (autoJoining && hasRooms) {
      waitForDialog = chatSettings.canCancel;
      autoJoinTimer = setInterval(autoJoiningHandler, 2 * 1000);
    }
  }

  /**
   * When user joins a room, do the following:
   * - Set up the .onMessage function for pinging
   * - Add the user's name to the chat tab and textarea
   * - Create a room-pair name for the Modding section
   * @param {object} room Room that the user has joined
   */
  var roomSetup = function (room) {
    var thisRoom = getRoom(room.room);
    var userId = getIdFromChatTab(thisRoom);
    var moddingModule = rphToolsModule.getModule('Modding Module');

    thisRoom.onMessage = function (data) {
      var thisRoom = this;
      if (account.ignores.indexOf(data.userid) !== -1) {
        return;
      }
      postMessage(thisRoom, data);
    };

    if (chatSettings.showNames) {
      addNameToUI(thisRoom, userId);
    }

    if (moddingModule !== null) {
      moddingModule.addModFeatures(thisRoom);
    }

    if (chatSettings.session === true) {
      if (arrayObjectIndexOf(chatSettings.roomSession, 'roomname', room.room) === -1 ||
        arrayObjectIndexOf(chatSettings.roomSession, 'user', room.userid) === -1) {
        var tempData = {
          'roomname': room.room,
          'user': room.userid
        };
        chatSettings.roomSession.push(tempData);
      }
    }

    resizeChatTabs();
    getUserById(userId, function (User) {
      var chatTextArea = $('textarea.'+User.props.id+'_'+makeSafeForCss(thisRoom.props.name));
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
  var postMessage = function (thisRoom, data) {
    getUserById(data.userid, function (User) {
      var moddingModule = rphToolsModule.getModule('Modding Module');
      var timestamp = makeTimestamp(data.time);
      var msg = parseMsg(data.msg);
      var classes = '';
      var $el = '';
      var msgHtml = '';

      if (User.blocked) {
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
          if (pingSound !== null) {
            pingSound.play();
          }
        }

        if (moddingModule !== null && isModOfRoom(thisRoom) === true) {
          var modSettings = moddingModule.getSettings();
          testRegex = matchPing(msg, modSettings.alertWords, false, true);
          if (testRegex !== null) {
            msg = highlightPing(msg, testRegex, "#EEE", "#E00", true, false);
            highlightRoom(thisRoom, "#EEE", "#E00");
            if (pingSound !== null) {
              moddingModule.playAlert();
            }
            //moddingModule.autoKick(thisRoom, data.userid, msg);
          }
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

      if (chatSettings.noIcons) {
        $el = appendMessageTextOnly(msgHtml, thisRoom).addClass(classes);
      } else {
        $el = thisRoom.appendMessage(msgHtml).addClass(classes);
      }
      $el.find('br:gt(7)').remove();
    });
  };

  /**
   * Parses a slash command from an input source.
   * @param {object} inputTextBox HTML element that holds the input textbox
   * @param {object} Room Room data
   * @param {object} User User data
   */
  function parseSlashCommand(inputTextBox, Room, User) {
    var newMessage = inputTextBox.val();
    var thisTab = rph.tabs[User.props.id];
    var error = false;
    var cmdArgs = newMessage.split(/ (.+)/);
    var outMsg = -1;

    switch (cmdArgs[0]) {
      case '/me':
        sendChatMessage(inputTextBox, Room, User);
        break;
      case '/coinflip':
        var rngModule = rphToolsModule.getModule('RNG Module');
        if (rngModule) {
          inputTextBox.val(rngModule.genCoinFlip() + '\u200b');
          sendChatMessage(inputTextBox, Room, User);
        }
        break;
      case '/status':
      case '/away':
        if (cmdArgs.length < 2){
          error = true;
        }
        else {
          var type = 0;
          if (cmdArgs[0] === '/away'){
            type = 1;
          }
          console.log('Status msg', cmdArgs[1], type);
          socket.emit('modify', {userid:User.props.id, statusMsg:cmdArgs[1], statusType:type});
          inputTextBox.val('');
        }
        break;
      case '/color':
        if (cmdArgs.length < 2){
          error = true;
        }
        else if (validateColor(cmdArgs[1]) && validateColorRange(cmdArgs[1])){
          socket.emit('modify', {userid: User.props.id, color: cmdArgs[1] });
          inputTextBox.css('color', cmdArgs[1]);
        }
        else {
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
        var moddingModule = rphToolsModule.getModule('Modding Module');
        if (cmdArgs.length < 2){
          error = true;
        }
        else if (moddingModule) {
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
        Room.appendMessage(
          '<span class="first">&nbsp;</span>\n\
        <span title="' + makeTimestamp(false, true) + '">Command ' +
          cmdArgs[0].substring(1, cmdArgs[0].length) + ' is not supported</span>'
        ).addClass('sys');
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
    var boldEnabled = "";
    var italicsEnabled = "";

    if (bold === true) {
      boldEnabled = "font-weight: bold; ";
    }

    if (italicize === true) {
      italicsEnabled = "font-style:italic; ";
    }
    msg = msg.replace(testRegex, '<span style="color: ' + color +
      '; background: ' + highlight + '; ' + boldEnabled +
      italicsEnabled + '">' + msg.match(testRegex) + '</span>');

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
  var addNameToUI = function (thisRoom, userId) {
    getUserById(userId, function (User) {
      var tabsLen = thisRoom.$tabs.length;
      var idRoomName = thisRoom.$tabs[tabsLen - 1][0].className.split(' ')[2];
      var newTabHtml = '<span>' + thisRoom.props.name + '</span><p style="font-size: x-small; margin-top: -58px;">' + User.props.name + '</p>';
      thisRoom.$tabs[tabsLen - 1].html(newTabHtml);
      $('<a class="close ui-corner-all">x</a>').on('click', function (ev) {
        ev.stopPropagation();
        chatSocket.emit('leave', {
          userid: User.props.id,
          name: thisRoom.props.name
        });
      }).appendTo(thisRoom.$tabs[tabsLen - 1]);
      $('textarea.' + idRoomName).prop('placeholder', 'Post as ' + User.props.name);
      $('textarea.' + idRoomName).css('color', "#" + User.props.color);
    });
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
   * Handler for the auto-joining mechanism
   **/
  var autoJoiningHandler = function () {
    if (roomnames.length > 0) {
      if (waitForDialog === true) {
        $('<div id="rpht-autojoin" class="inner">' +
          '<p>Autojoining or restoring session.</p>' +
          '<p>Press "Cancel" to stop autojoin or session restore.</p>' +
          '</div>').dialog({
          open: function (event, ui) {
            setTimeout(function () {
              $('#rpht-autojoin').dialog('close');
            }, AUTOJOIN_TIMEOUT_SECS * 1000);
          },
          buttons: {
            Cancel: function () {
              clearTimeout(autoJoinTimer);
              $(this).dialog("close");
            }
          },
        }).dialog('open');

        waitForDialog = false;
        clearTimeout(autoJoinTimer);
        autoJoinTimer = setTimeout(autoJoiningHandler, AUTOJOIN_TIMEOUT_SECS * 1000);
      } else {
        if (chatSettings.autoJoin === true) {
          JoinFavoriteRooms();
        }
        if (chatSettings.session) {
          for (var i = 0; i < chatSettings.roomSession.length; i++) {
            var room = chatSettings.roomSession[i];
            var roomInFavs = arrayObjectIndexOf(chatSettings.favRooms, 'room', room.roomname) > -1;
            var userInFavs = arrayObjectIndexOf(chatSettings.favRooms, 'userId', room.user) > -1;
            var canJoin = (roomInFavs != userInFavs) || chatSettings.autoJoin;

            /* Restore session if:
                User xor room are not in favorites
                Autojoin is not enabled.
            */
            if (canJoin) {
              chatSocket.emit('join', {
                name: room.roomname,
                userid: room.user
              });
            }
          }
        }
        chatSettings.roomSession = [];
        clearTimeout(autoJoinTimer);
      }
    }
  };

  /** 
   * Joins all the rooms in the favorite rooms list
   */
  var JoinFavoriteRooms = function () {
    console.log('Joining favorite rooms');
    for (var i = 0; i < chatSettings.favRooms.length; i++) {
      var favRoom = chatSettings.favRooms[i];
      console.log('Joining favorite room', favRoom);
      chatSocket.emit('join', {
        name: favRoom.room,
        userid: favRoom.userId,
        pw: favRoom.roomPw
      });
    }
  };

  /**
   * Updates the chat session (which rooms the user is in at the time)
   */
  var updateSession = function () {
    var tempSession = [];
    for (var i = 0; i < rph.roomsJoined.length; i++) {
      var roomname = rph.roomsJoined[i].roomname;
      if (arrayObjectIndexOf(chatSettings.roomSession, 'roomname', roomname) !== -1) {
        tempSession.push(rph.roomsJoined[i]);
      }
    }
    chatSettings.roomSession = tempSession;
    saveSettings();
  };

  /** 
   * Adds an entry to the Favorite Chat Rooms list
   */
  var addFavoriteRoom = function () {
    var room = getRoom($('#favRoom').val());

    if (room === undefined) {
      markProblem('favRoom', true);
      return;
    }

    if (chatSettings.favRooms.length < MAX_ROOMS) {
      var favExists = false;
      var hashStr = $('#favRoom').val() + $('#favUserDropList option:selected').html();
      var favRoomObj = {
        _id: hashStr.hashCode(),
        user: $('#favUserDropList option:selected').html(),
        userId: parseInt($('#favUserDropList option:selected').val()),
        room: $('#favRoom').val(),
        roomPw: $('#favRoomPw').val()
      };

      markProblem('favRoom', false);
      if (arrayObjectIndexOf(chatSettings.favRooms, "_id", favRoomObj._id) === -1) {
        $('#favRoomsList').append(
          '<option value="' + favRoomObj._id + '">' +
          favRoomObj.user + ": " + favRoomObj.room + '</option>'
        );
        chatSettings.favRooms.push(favRoomObj);
        console.log('RPH Tools[addFavoriteRoom]: Added favorite room', favRoomObj);
      }

      if (chatSettings.favRooms.length >= 10) {
        $('#favAdd').text("Favorites Full");
        $('#favAdd')[0].disabled = true;
      }
    }
  };

  /** 
   * Removes an entry to the Favorite Chat Rooms list
   */
  var removeFavoriteRoom = function () {
    var favItem = document.getElementById("favRoomsList");
    var favItemId = $('#favRoomsList option:selected').val();
    favItem.remove(favItem.selectedIndex);

    for (var favs_i = 0; favs_i < chatSettings.favRooms.length; favs_i++) {
      if (chatSettings.favRooms[favs_i]._id == favItemId) {
        chatSettings.favRooms.splice(favs_i, 1);
        break;
      }
    }

    if (chatSettings.favRooms.length < 10) {
      $('#favAdd').text("Add");
      $('#favAdd')[0].disabled = false;
    }
  };

  /**
   * Handlers for text color changing
   */
  var changeTextColor = function () {
    var text_color = $('input#userNameTextColor').val();
    if (validateSetting('input#userNameTextColor', 'color') === true) {
      var userId = $('#userColorDroplist option:selected').val();
      text_color = text_color.substring(1, text_color.length);
      getUserById(userId, function (User) {
        socket.emit('modify', {
          userid: User.props.id,
          color: text_color
        });
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
      'showNames': true,
      'noIcons': false,
      'canCancel': false,
      'autoJoin': false,
      'session': false,
      'favRooms': [],
      'RoomSession': [],
    };

    populateSettings();
  };

  /**
   * Populate the GUI with settings from the browser's local storage
   */
  var populateSettings = function () {
    $('#favUserDropList').empty();

    $('#pingNames').val(pingSettings.triggers);
    $('#pingURL').val(pingSettings.audioUrl);
    $('#pingTextColor').val(pingSettings.color);
    $('#pingHighlightColor').val(pingSettings.highlight);
    $('input#pingBoldEnable').prop("checked", pingSettings.bold);
    $('input#pingItalicsEnable').prop("checked", pingSettings.italics);
    $('input#pingExactMatch').prop("checked", pingSettings.exact);
    $('input#pingCaseSense').prop("checked", pingSettings.case);


    $('input#favEnable').prop("checked", chatSettings.autoJoin);
    $('input#showUsername').prop("checked", chatSettings.showNames);
    $('inputimgIconDisable').prop("checked", chatSettings.noIcons);
    $('#roomSessioning').prop("checked", chatSettings.session);
    $('#canCancelJoining').prop("checked", chatSettings.canCancel);

    for (var i = 0; i < chatSettings.favRooms.length; i++) {
      var favRoomObj = chatSettings.favRooms[i];
      $('#favRoomsList').append(
        '<option value="' + favRoomObj._id + '">' +
        favRoomObj.user + ": " + favRoomObj.room + '</option>'
      );
    }

    if (chatSettings.favRooms.length >= 10) {
      $('#favAdd').text("Favorites Full");
      $('#favAdd')[0].disabled = true;
    }

    pingSound = new Audio(pingSettings.audioUrl);

    if (chatSettings.session) {
      updateSessionTimer = setInterval(updateSession, 30 * 1000);
    }
  };

  /**
   * @brief Processes account events.
   **/
  var processAccountEvt = function () {
    var namesToIds = rphToolsModule.getNamesToIds();
    $('#userColorDroplist').empty();
    $('#favUserDropList').empty();
    for (var name in namesToIds) {
      addToDroplist(namesToIds[name], name, userColorDroplist);
      addToDroplist(namesToIds[name], name, favUserDropList);
    }
  };

  var getSettings = function () {
    return {
      'chatSettings': chatSettings,
      'pingSettings': pingSettings
    };
  };

  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'Chat Module';
    },

    parseSlashCommand: parseSlashCommand,
    getSettings: getSettings,
    saveSettings: saveSettings,
    loadSettings: loadSettings,
    deleteSettings: deleteSettings,
    processAccountEvt: processAccountEvt,
  };
}());