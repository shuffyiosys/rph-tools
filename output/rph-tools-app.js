// ==UserScript==
// @name       RPH Tools TEST
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    4.0.3
// @description Adds extended settings to RPH
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT
// ==/UserScript==

var VERSION_STRING = '4.0.3';
/**
 * Gets the value from an input element.
 * @param {string} settingId Full selector of the input to get its value
 * @return The extracted HTML's value
 */
var getInput = function (settingId) {
  return $(settingId).val();
};

/**
 * Gets the value of a checkbox
 * @param {string} settingId Full selector of the checkbox to get the value
 * @return The extracted HTML's value
 */
var getCheckBox = function (settingId) {
  return $(settingId).is(':checked');
};

/**
 * Marks an HTML element with red or white if there's a problem
 * @param {string} element Full selector of the HTML element to mark
 * @param {boolean} mark If the mark is for good or bad
 */
var markProblem = function (element, mark) {
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
var validateSetting = function (settingId, setting) {
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
var validateColor = function (color) {
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
 * Makes sure the color is less than #D2D2D2 or #DDD depending on how many 
 * digits were entered.
 * @param {string} TextColor String representation of the color.
 * @return True if the color is within range, false otherwise.
 */
var validateColorRange = function (TextColor) {
  var rawHex = TextColor.substring(1, TextColor.length);
  var red = 255;
  var green = 255;
  var blue = 255;

  /* If the color text is 3 characters, limit it to #DDD */
  if (rawHex.length == 3) {
    red = parseInt(rawHex.substring(0, 1), 16);
    green = parseInt(rawHex.substring(1, 2), 16);
    blue = parseInt(rawHex.substring(2, 3), 16);

    if ((red <= 13) && (green <= 13) && (blue <= 13)) {
      return true;
    }
  }
  /* If the color text is 6 characters, limit it to #D2D2D2 */
  else if (rawHex.length == 6) {
    red = parseInt(rawHex.substring(0, 2), 16);
    green = parseInt(rawHex.substring(2, 4), 16);
    blue = parseInt(rawHex.substring(4, 6), 16);
    if ((red <= 210) && (green <= 210) && (blue <= 210)) {
      return true;
    }
  }

  console.log('RPH Tools[validateColorRange]: Color check failed',
    rawHex, red, green, blue);
  return false;
};

/**
 * Adds an option to a select element with a value and its label
 * @param {string} value Value of the option element
 * @param {string} label Label of the option element
 * @param {object} droplist Which select element to add option to
 */
var addToDroplist = function (value, label, droplist) {
  droplist.append($('<option>', {
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
var arrayObjectIndexOf = function (objArray, key, value) {
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
var isInLink = function (searchTerm, msg) {
  var regexp = new RegExp('href=".*?' + searchTerm + '.*?"', '');
  return regexp.test(msg);
};

/**
 * Checks if the current account is a mod of the room.
 * @param {object} room Object containing room data
 */
var isModOfRoom = function (room) {
  for (var idx = 0; idx < account.users.length; idx++) {
    if (room.props.mods.indexOf(account.users[idx]) > -1 ||
      room.props.owners.indexOf(account.users[idx]) > -1) {
      return true;
    }
  }
  return false;
};

/**
 * Takes a dictionary and creates a sorted version of it based on its keys
 * @param {object} dict Dictionary to be sorted
 * @returns Sorted dictionary
 */
var sortOnKeys = function (dict) {
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
/**
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
   * Appends message to a room without adding an image icon
   * @param {string} html - HTML to add to the room.
   * @param {object} thisRoom - Object to the room receiving the message.
   *
   * This was modified from RPH's original code, which is not covered by the
   * license.
   */
  var appendMessageTextOnly = function (html, thisRoom) {
    var $el = $('<div>\n' + html + '\n</div>').appendTo(thisRoom.$el);
    var extra = 5; //add more if near the bottom
    if (thisRoom.$el[0].scrollHeight - thisRoom.$el.scrollTop() < 50) {
      extra = 60;
    }
    thisRoom.$el.animate({
      scrollTop: '+=' + ($el.outerHeight() + extra)
    }, 180);

    if (thisRoom.$el.children('div').length > account.settings.maxHistory) {
      thisRoom.$el.children('div:not(.sys):lt(3)').remove();
    }

    return $el;
  };

/**
 * Modified handler for keyup events from the chat textbox
 * @param {object} ev - Event
 * @param {object} User - User the textbox is attached to
 * @param {oject} Room - Room the textbox is attached to
 */
function intputChatText(ev, User, Room){
  var inputTextBox = null;
  Room.$tabs.forEach(function(roomTab){
    var classesLen = roomTab[0].classList.length;
    if(roomTab[0].classList[classesLen-1] === 'active'){
      inputTextBox = $('textarea.'+User.props.id+'_'+makeSafeForCss(Room.props.name));
    }
  });
  if (ev.keyCode === 13 && ev.ctrlKey === false && ev.shiftKey === false && inputTextBox.val() !== '' && inputTextBox.val().trim() !== ''){
    var newMessage = inputTextBox.val();
    if( newMessage.length > 4000 ){
      Room.appendMessage(
            '<span class="first">&nbsp;</span>\n\
            <span title="'+makeTimestamp(false, true)+'">Message too long</span>'
          ).addClass('sys');
      return;
    }
    if (newMessage[0] === '/' && newMessage.substring(0,2) !== '//'){
      chatModule.parseSlashCommand(inputTextBox, Room, User);
    }
    else {
      sendChatMessage(inputTextBox, Room, User);
    }
  }
}

function sendChatMessage(inputTextBox, Room, User){
  var newMessage = inputTextBox.val();
  var thisTab = rph.tabs[User.props.id];
  var newLength = newMessage.length;
  Room.sendMessage(newMessage, User.props.id);
  inputTextBox.val('');

  if( newMessage.match(/\n/gi) ){
    newLength = newLength + (newMessage.match(/\n/gi).length * 250);
  }
  var curTime = Math.round(new Date().getTime() / 1000);
  thisTab.bufferLength = (thisTab.bufferLength / (curTime - thisTab.lastTime + 1)) + ((newLength+thisTab.bufferLength)/3) + 250;
  thisTab.lastTime = curTime;
  if( thisTab.bufferLength > 1750 ){
    thisTab.offenses += 1;
    if( thisTab.offenses > 2 ){
      Room.sendMessage( 'Flood kick', User.props.id);
      chatSocket.disconnect();
      return;
    } else {
      Room.appendMessage(
            '<span class="first">&nbsp;</span>\n\
            <span title="'+makeTimestamp(false, true)+'">You are flooding. Be careful or you\'ll be kicked</span>'
          ).addClass('sys');
      setTimeout(function(){
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
      var newTabHtml = '<span>' + thisRoom.props.name + '</span><p style="font-size: x-small; position: absolute; top: 12px;">' + User.props.name + '</p>';
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
    if ($('#chat-tabs')[0].clientWidth < $('#chat-tabs')[0].scrollWidth ||
      $('#chat-tabs')[0].clientWidth + 200 > $('#chat-bottom')[0].clientWidth) {
      $('#chat-top').css('padding-bottom', '146px');
      $('#chat-bottom').css('margin-top', '-144px');
    } else {
      $('#chat-top').css('padding-bottom', '130px');
      $('#chat-bottom').css('margin-top', '-128px');
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
   *
   * @param account - Data blob countaining the user's account.
   **/
  var processAccountEvt = function (account) {
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
}());/**
 * This module handles features for the PM system.
 */
var pmModule = (function () {
  var pmSettings = {
    'audioUrl': 'http://chat.rphaven.com/sounds/imsound.mp3',
    'noIcons': false,
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
      '<label class="rpht_labels">Mute PMs: </label><input style="width: 40px;" type="checkbox" id="pmMute" name="pmMute">' +
      '<br /><br />' +
      '<label class="rpht_labels">No Image Icons: </label><input style="width: 40px;" type="checkbox" id="pmIconsDisable" name="pmIconsDisable">'
  };

  var awayMessages = {};

  var init = function () {
    $('#pmNamesDroplist').change(function () {
      var userId = $('#pmNamesDroplist option:selected').val();
      var message = '';

      if (awayMessages[userId] !== undefined) {
        message = awayMessages[userId].message;
      }
      $('input#awayMessageTextbox').val(message);
    });

    $('#setAwayButton').click(function () {
      setPmAway();
    });

    $('#removeAwayButton').click(function () {
      removePmAway();
    });

    $('#pmPingURL').change(function () {
      if (validateSetting('pmPingURL', 'url')) {
        pmSettings.audioUrl = getInput('pmPingURL');
        $('#im-sound').children("audio").attr('src', pmSettings.audioUrl);
        saveSettings();
      }
    });

    $('#pmMute').change(function () {
      if ($('#pmMute').is(":checked")) {
        $('#im-sound').children("audio").attr('src', '');
      } else {
        $('#im-sound').children("audio").attr('src', pmSettings.audioUrl);
      }
    });

    $('#pmIconsDisable').change(function () {
      pmSettings.noIcons = getCheckBox('pmIconsDisable');
      saveSettings();
    });

    loadSettings(JSON.parse(localStorage.getItem(localStorageName)));

    socket.on('pm', function (data) {
      handleIncomingPm(data);
    });

    socket.on('outgoing-pm', function (data) {
      handleOutgoingPm(data);
    });
  }

  /**
   * Handler for PMs that are incoming
   * @param {object } data Data containing the PM.
   */
  var handleIncomingPm = function (data) {
    getUserById(data.to, function (fromUser) {
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
    });
  }

  /**
   * Handler for PMs that are outgoing
   * @param {object } data Data containing the PM.
   */
  var handleOutgoingPm = function (data) {
    getUserById(data.from, function (fromUser) {
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
    });
  }

  /**
   * Adds an away status to a character
   */
  var setPmAway = function () {
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
  var removePmAway = function () {
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

  /**
   * Save current settings
   */
  var saveSettings = function () {
    localStorage.setItem(localStorageName, JSON.stringify(pmSettings));
  };

  /**
   * Loads settings from local storage
   * @param {object} storedSettings Object containing the settings
   */
  var loadSettings = function (storedSettings) {
    if (storedSettings !== null) {
      pmSettings = storedSettings;
    }
    populateSettings();
  };

  /**
   * Deletes the current settings and resets them to defaults.
   */
  var deleteSettings = function () {
    localStorage.removeItem(localStorageName);
    pmSettings = {
      'audioUrl': 'http://chat.rphaven.com/sounds/imsound.mp3',
      'noIcons': false,
    };
    populateSettings();
  };

  /**
   * Populate the GUI with settings from the browser's local storage
   */
  var populateSettings = function () {
    $('#pmPingURL').val(pmSettings.audioUrl);
    $('input#pmIconsDisable').prop("checked", pmSettings.noIcons);
  };

  /**
   * Gets the current settings.
   * @returns Object containing the current settings.
   */
  var getSettings = function () {
    return pmSettings;
  };

  /**
   * Processes account events.
   * @param {object} account Data blob countaining the user's account.
   */
  var processAccountEvt = function (account) {
    var namesToIds = rphToolsModule.getNamesToIds();
    $('#pmNamesDroplist').empty();
    for (var name in namesToIds){
      addToDroplist(namesToIds[name], name, $('#pmNamesDroplist'));
    }
  };

  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'PM Module';
    },

    getSettings: getSettings,
    saveSettings: saveSettings,
    loadSettings: loadSettings,
    deleteSettings: deleteSettings,
    processAccountEvt: processAccountEvt,
  };
}());

/** 
 * Random number generator module. This is mostly used for chance games that
 * can happen in the chat
 */
var rngModule = (function () {
  var DIE_MIN = 1;
  var DIE_MAX = 100;
  var DIE_SIDE_MIN = 2;
  var DIE_SIDE_MAX = 1000;
  var RNG_NUM_MIN = -4294967296;
  var RNG_NUM_MAX = 4294967296;

  var html = {
    'tabId': 'rng-module',
    'tabName': 'Random Numbers',
    'tabContents': '<h3>Random Number Generators</h3>' +
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
  var init = function () {
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
  var genCoinFlip = function () {
    var coinMsg = '(( Coin toss: ';
    if (Math.ceil(Math.random() * 2) == 2) {
      coinMsg += '**heads!**))';
    } else {
      coinMsg += '**tails!**))';
    }

    return coinMsg;
  };

  /**
   * Genreates a dice roll
   * @param {number} dieNum Number of die to use
   * @param {number} dieSides Number of sides per die
   * @param {boolean} showTotals Flag to show the total value of the roll
   * @returns String containing the dice roll result
   */
  var getDiceRoll = function (dieNum, dieSides, showTotals) {
    //Cap the values, just in case.
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
    return dieMsg;
  };

  /**
   * Generates a random number between a min and max
   * @param {number} minNum Minimum end of the range
   * @param {number} maxNum Maximum end of the range
   * @returns String containing the random number result.
   */
  var genRandomNum = function (minNum, maxNum) {
    var ranNumMsg = '(( Random number generated (' + minNum + ' to ' +
      maxNum + '): **';
    ranNumMsg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) +
      '** ))';
    return ranNumMsg;
  };

  /**
   * Sends the result of a random number generated to the server
   * @param {string} outcomeMsg A built string to show up on the chat.
   */
  var sendResult = function (outcomeMsg) {
    var class_name = $('li.active')[0].className.split(" ");
    var room_name = "";
    var this_room = null;
    var userID = parseInt(class_name[2].substring(0, 6));
    var chatModule = rphToolsModule.getModule('Chat Module');

    /* Populate room name based on if showing usernames is checked. */
    if (chatModule) {
      var chatSettings = chatModule.getSettings();
      if (chatSettings.chatSettings.showNames) {
        room_name = $('li.active').find("span:first").text();
      } else {
        room_name = $('li.active')[0].textContent.slice(0, -1);
      }
    } else {
      room_name = $('li.active')[0].textContent.slice(0, -1);
    }

    this_room = getRoom(room_name);
    outcomeMsg += '\u200b';
    this_room.sendMessage(outcomeMsg, userID);
  };

  /**
   * Public members of the module exposed to others.
   */
  return {
    init: init,
    genCoinFlip: genCoinFlip,
    getDiceRoll: getDiceRoll,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'RNG Module';
    },
  };
}());

/**
 * This module handles adding blocking of users. This is meant to supersede
 * RPH's blocking mechanisms since it isn't always reliable.
 */
var blockingModule = (function () {
  var blockedUsers = [];

  var localStorageName = 'rpht_BlockingModule';

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

  var init = function () {
    $('#blockButton').click(function () {
      var username = $('#nameCheckTextbox').val();
      if (username) {
        getUserByName(username, function (user) {
          addToBlockList(user);
          user.blocked = true;
          saveSettings();
        });
      }
    });

    $('#unblockButton').click(function () {
      var names = document.getElementById("blockedDropList");
      var userId = $('#blockedDropList option:selected').val();
      getUserById(userId, function (user) {
        socket.emit('unblock', {'id':user.props.id});
        names.remove(names.selectedIndex);
        user.blocked = false;
        blockedUsers.splice(blockedUsers.indexOf(userId), 1);
        saveSettings();
      });
    });

    socket.on('ignores', function (data) {
      getUserById(data.ids[0], function (user) {
        addToBlockList(user);
        user.blocked = true;
        saveSettings();
      });
    });

    loadSettings();

    setInterval(reblockList, 30 * 1000);
  };

  /**
   * Adds a user to the native and RPHT block list.
   * @param {object} User object for the username being blocked
   */
  var addToBlockList = function (user) {
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
  var reblockList = function () {
    blockedUsers.forEach(function(blockedUser, index){
      getUserById(blockedUser.id, function (user) {
        addToBlockList(user);
        user.blocked = true;
      });
    });
  };

  /** 
   * Saves settings into the browser's local storage
   */
  var saveSettings = function () {
    localStorage.setItem(localStorageName, JSON.stringify(blockedUsers));
  };

  /**
   * Loads settings from the browser's local storage
   */
  var loadSettings = function () {
    var storedSettings = JSON.parse(localStorage.getItem(localStorageName));
    if (storedSettings !== null) {
      blockedUsers = storedSettings;
    }

     $('#blockedDropList').empty();
    blockedUsers.forEach(function(blockedUser, index){
      $('#blockedDropList').append('<option value="' + blockedUser.id + '">' +
      blockedUser.name + '</option>');
    });
    reblockList();
  };

  /**
   * Deletes settings from the browser's local storage
   */
  var deleteSettings = function () {
    localStorage.removeItem(localStorageName);
    blockedUsers = [];
     $('#blockedDropList').empty();
  };

  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'Blocking Module';
    },

    getSettings: function () {
      return blockedUsers;
    },
  };
}());
/**
 * This module handles chat modding features. These include an easier way to
 * issue kicks, bans, promotions and demotions. It also can set up monitoring
 * of certain words and alert the mod.
 */
var moddingModule = (function () {
  var settings = {
    'alertWords': [],
    'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
  };

  var localStorageName = "rpht_modSettings";

  var html = {
    'tabId': 'modding-module',
    'tabName': 'Modding',
    'tabContents': '<h3>Modding</h3>' +
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
      '<label class="rpht_labels">Alert Sound URL: </label><input style="width: 370px;" type="text" id="modAlertUrl" name="modAlertUrl">'
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
      var user = $('input#modFromTextInput').val();
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

    loadSettings();
    populateSettings();
  };

  /**
   * Performs a modding action
   * @param {string} action Name of the action being performed
   */
  var modAction = function (action) {
    var targets = $('#modTargetTextInput').val().replace(/\r?\n|\r/, '');
    targets = targets.split(',');
    console.log('RPH Tools[modAction]: Performing', action, 'on', targets);

    targets.forEach(function (target, index) {
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

  /**
   * Initializes extra features if user is a mod of the room. This looks for
   * the room's mod array and sees if any of the IDs match what's in the 
   * account.users array
   * @param {object} thisRoom - Room that was entered
   */
  var addModFeatures = function (thisRoom) {
    for (var user in account.users) {
      var userId = account.users[user];
      if (thisRoom.props.mods.indexOf(userId) > -1 ||
        thisRoom.props.owners.indexOf(userId) > -1) {
        addModRoomPair(userId, thisRoom);
      }
    }
  };

  /**
   * Adds a key/value pair option to the Room-Name Pair droplist.
   * @param {number} userId User ID of the mod
   * @param {object} thisRoom Object containing the room data.
   */
  var addModRoomPair = function (userId, thisRoom) {
    getUserById(userId, function (user) {
      var roomNamePair = thisRoom.props.name + ': ' + user.props.name;
      var roomNameValue = thisRoom.props.name + '.' + userId;
      var roomNameObj = {
        'roomName': thisRoom.props.name,
        'modName': user.props.name,
        'modId': userId
      };
      if (roomNamePairs[roomNameValue] === undefined) {
        roomNamePairs[roomNameValue] = roomNameObj;
        $('#roomModSelect').append('<option value="' + roomNameValue + '">' +
          roomNamePair + '</option>');
      }
    });
  }

  /**
   * Plays the alert sound
   */
  var playAlert = function () {
    if (alertSound !== null) {
      alertSound.play();
    }
  };

  /**
   * Saves settings to local storage
   */
  var saveSettings = function () {
    localStorage.setItem(localStorageName, JSON.stringify(settings));
  };

  /** 
   * Loads saved settings if they exist
   */
  var loadSettings = function () {
    var storedSettings = JSON.parse(localStorage.getItem(localStorageName));

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
  };

  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'Modding Module';
    },

    getSettings: function () {
      return settings;
    },

    emitModAction: emitModAction,
    addModFeatures: addModFeatures,
    saveSettings: saveSettings,
    playAlert: playAlert,
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

  /**
   * Handles the initial portion of importing settings. This checks the input
   * to see if it's a valid JSON formatted string.
   */
  var importSettingsHanlder = function () {
    settings = $('textarea#importExportTextarea').val().split("|");
    try {
      for (var i = 0; i < settings.length - 1; i++) {
        var settingsObj = JSON.parse(settings[i]);
        console.log('RPHT [Setting Module]: Importing...', settingsObj);
        importSettings(settingsObj);
      }
    } catch (err) {
      console.log('RPH Tools[importSettings]: Error importing settings', err);
      markProblem("importExportTextarea", true);
    }
  }

  /**
   * Takes the object from the JSON formatted string and imports it into the
   * relevant modules
   * @param {Object} settingsObj 
   */
  var importSettings = function (settingsObj) {
    var module = rphToolsModule.getModule(settingsObj.name);

    if (!module) {
      return;
    } else if (!module.loadSettings) {
      return;
    }
    module.loadSettings(settingsObj.settings);
  };

  /**
   * Exports settings into a JSON formatted string
   */
  var exportSettings = function () {
    var settingsString = "";
    var modules = rphToolsModule.getModules();
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

  /** 
   * Logic to confirm deleting settings. The button needs to be pressed twice
   * within 10 seconds for the settings to be deleted.
  */
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

  /** 
   * Deletes all of the settings of the modules that have settings.
  */
  var deleteAllSettings = function () {
    var modules = rphToolsModule.getSettings();
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].deleteSettings) {
        modules[i].deleteSettings();
      }
    }
  };

  /** 
   * Public members of the module
   */
  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'Settings Module';
    },
  };
}());/**
 * This module handles the "About" section for information on RPH Tools.
 */
var aboutModule = (function () {
  var html = {
    'tabId': 'about-module',
    'tabName': 'About',
    'tabContents': '<h3>RPH Tools</h3>' +
      '<p><strong>Version: ' + VERSION_STRING + '</strong></p></br>' +
      '<p>Created by shuffyiosys. Under MIT License (SPDX: MIT). Feel free to make contributions to <a href="https://github.com/shuffyiosys/rph-tools">the repo</a>!</p><br />' +
      '<p>If the script isn\'t working, try some <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target="_blank">Troubleshooting Tips</a></p><br />' +
      '<p>Found a problem? <a href="http://www.rphaven.com/topics.php?id=1#topic=1883&page=1" target="_blank">Report it on RPH Forums</a></p><br />' +
      '<p>Grab <a href="https://openuserjs.org/install/shuffyiosys/RPH_Tools.user.js" target="_blank">the latest version</a></p><br />'
  };

  return {
    init: function () {
      return;
    },

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'About Module';
    },
  };
}());

/**
 * Main RPH Tools module
 */
var rphToolsModule = (function () {
  var namesToIds = {};

  var modules = [];

  var rpht_css =
    '<style>' +
    '.rpht_labels{display: inline-block; width: 300px; text-align: right; margin-right: 10px;}' +
    '.rpht_textarea{border: 1px solid black; width: 611px;}' +
    '.rpht_chat_tab {' +
    'position: absolute;' +
    'height: 60px;' +
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

    socket.on('accounts', function () {
      var users = account.users;
      console.log('RPH Tools[_on.accounts]: Account data blob received', users);
      setTimeout(function(){
        for (i = 0; i < modules.length; i++) {
          modules[i].init();
        }
        mapNamesToIds(account);
      },1000);
      setTimeout(function(){
        processAccountEvt(account);
      },2000);
    });
  }

  /**
   * Maps user names to IDs into a dictionary
   * @param {object} account Account data blob
   */
  var mapNamesToIds = function(account){
    account.users.forEach(function(userId){
      getUserById(userId, function(user){
        namesToIds[user.props.name] = userId;
      });
    });
  }

  /**
   * Handler for processing the event when account data comes in.
   * @param {Dict} account Account data blob
   */
  var processAccountEvt = function (account) {
    namesToIds = sortOnKeys(namesToIds);
      for (var i = 0; i < modules.length; i++) {
        if (modules[i].processAccountEvt !== undefined) {
          modules[i].processAccountEvt(account);
        }
      }
    
  };

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

  return {
    init: init,
    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'RPH Tools Module';
    },

    getNamesToIds: function(){
      return namesToIds;
    },

    getModule: getModule,
    getModules: getModules,
  };
}());

/****************************************************************************
 * Script initializations to execute after the page loads
 ***************************************************************************/
$(function () {
  console.log('RPH Tools', VERSION_STRING, 'start');
  var modules = [
    chatModule,
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