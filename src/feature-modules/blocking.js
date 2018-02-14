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

    clearUsersDropLists('blockedDropList');
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
    clearUsersDropLists('blockedDropList');
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
