/**
 * This module handles the "Session" section in RPH Tools
 */
var sessionModule = (function () {
    var sessionSettings = {
        'dcHappened': false,
        'autoRefresh': false,
        'refreshSecs': 10,
        'canCancel': false,
        'joinFavorites': false,
        'joinSession': false,
        'roomSession': [],
        'favRooms': [],
    };

    var localStorageName = "rpht_SessionModule";

    var autoJoinTimer = null;

    var updateSessionTimer = null;

    var waitForDialog = true;

    var favUserDropList = null;

    var dcHappenedShadow = false;

    var sessionShadow = [];

    var MAX_ROOMS = 30;

    var AUTOJOIN_TIMEOUT_SECS = 5;

    var html = {
        'tabId': 'session-module',
        'tabName': 'Sessions',
        'tabContents': '<h3>Sessions</h3>' +
            '<h4>Auto Refresh</h4> Note: This will not save your text inputs or will re-join rooms with passwords. <br />' +
            '<label class="rpht_labels">Refresh on D/C: </label><input style="width: 40px;" type="checkbox" id="dcRefresh" name="dcRefresh">' +
            '<br /><br />' +
            '<label class="rpht_labels">Auto-refresh time: </label><input style="width: 64px;" type="number" id="refreshTime" name="refreshTime" max="60" min="5" value="10"> seconds' +
            '<h4>Auto Joining</h4>' +
            '<label class="rpht_labels">Can Cancel: </label><input style="width: 40px;" type="checkbox" id="canCancelJoining" name="canCancelJoining" checked>' +
            '<br /><br />' +
            '<label class="rpht_labels">Join favorites: </label><input style="width: 40px;" type="checkbox" id="favEnable" name="favEnable">' +
            '<br /><br />' +
            '<label class="rpht_labels">Always join last session: </label><input style="width: 40px;" type="checkbox" id="roomSessioning" name="roomSessioning">' +
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
            '</div><div>'
    };

    var init = function () {
        favUserDropList = $('#favUserDropList');

        $('#dcRefresh').click(function () {
            sessionSettings.autoRefresh = getCheckBox('#dcRefresh');
            saveSettings();
        });

        $('#refreshTime').change(function () {
            sessionSettings.refreshSecs = $('#refreshTime').val();
            saveSettings();
        });

        $('#canCancelJoining').click(function () {
            sessionSettings.canCancel = getCheckBox('#canCancelJoining');
            saveSettings();
        });

        $('#roomSessioning').click(function () {
            sessionSettings.joinSession = getCheckBox('#roomSessioning');
            if (sessionSettings.joinSession) {
                updateSessionTimer = setInterval(updateSession, 30 * 1000);
            } else {
                clearTimeout(updateSessionTimer);
            }
            saveSettings();
        });

        $('#favEnable').click(function () {
            sessionSettings.joinFavorites = getCheckBox('#favEnable');
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

        loadSettings();
        dcHappenedShadow = sessionSettings.dcHappened;
        sessionShadow = sessionSettings.roomSession;

        if (determineAutojoin()) {
            waitForDialog = sessionSettings.canCancel;
            autoJoinTimer = setInterval(autoJoiningHandler, 2 * 1000);
        }

        chatSocket.on('disconnect', function () {
            if (sessionSettings.autoRefresh){
                setTimeout(() => {
                    sessionSettings.dcHappened = true;
                    saveSettings();
                    window.onbeforeunload = null;
                    window.location.reload(true);
                }, sessionSettings.refreshSecs * 1000);
            }
        });

        sessionSettings.dcHappened = false;
        saveSettings();
    }

    var determineAutojoin = function() {
        var hasRooms = false;
        var autoJoin = sessionSettings.joinFavorites;
        autoJoin |= sessionSettings.joinSession;
        autoJoin |= sessionSettings.dcHappened;

        hasRooms |= (sessionSettings.favRooms.length > 0);
        hasRooms |= (sessionSettings.roomSession.length > 0);
        return autoJoin && hasRooms;
    }

    /**
     * Handler for the auto-joining mechanism.
     **/
    var autoJoiningHandler = function () {
        /* Don't run this if there's no rooms yet. */
        if (roomnames.length === 0) {
            return;
        }

        if (waitForDialog === true) {
            $('<div id="rpht-autojoin" class="inner">' +
                '<p>Autojoining or restoring session.</p>' +
                '<p>Press "Cancel" to stop autojoin or session restore.</p>' +
                '</div>'
            ).dialog({
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
            autoJoinTimer = setTimeout(JoinRooms, AUTOJOIN_TIMEOUT_SECS * 1000);
        } else {
            JoinRooms();
        }
    };

    var JoinRooms = function(){
        if (sessionSettings.joinFavorites === true) {
            JoinFavoriteRooms();
        }

        setTimeout(function(){
            if (sessionSettings.joinSession || dcHappenedShadow) {
                dcHappenedShadow = false;
                JoinSessionedRooms();
            }
        }, 1000);

        clearTimeout(autoJoinTimer);
    }

    var JoinSessionedRooms = function(){
        for (var i = 0; i < sessionShadow.length; i++) {
            var room = sessionShadow[i];
            var roomJoined = arrayObjectIndexOf(rph.roomsJoined, 'roomname', room.roomname) > -1;
            var userJoined = arrayObjectIndexOf(rph.roomsJoined, 'user', room.user) > -1;
            var alreadyInRoom = roomJoined && userJoined;
            if(!alreadyInRoom){
                chatSocket.emit('join', {
                    name: room.roomname,
                    userid: room.user
                });
            }
        }
    }

    /** 
     * Joins all the rooms in the favorite rooms list
     */
    var JoinFavoriteRooms = function () {
        for (var i = 0; i < sessionSettings.favRooms.length; i++) {
            var favRoom = sessionSettings.favRooms[i];
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
        sessionSettings.roomSession = rph.roomsJoined;
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

        if (sessionSettings.favRooms.length < MAX_ROOMS) {
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
            if (arrayObjectIndexOf(sessionSettings.favRooms, "_id", favRoomObj._id) === -1) {
                $('#favRoomsList').append(
                    '<option value="' + favRoomObj._id + '">' +
                    favRoomObj.user + ": " + favRoomObj.room + '</option>'
                );
                sessionSettings.favRooms.push(favRoomObj);
                console.log('RPH Tools[addFavoriteRoom]: Added favorite room', favRoomObj);
            }

            if (sessionSettings.favRooms.length >= 10) {
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

        for (var favs_i = 0; favs_i < sessionSettings.favRooms.length; favs_i++) {
            if (sessionSettings.favRooms[favs_i]._id == favItemId) {
                sessionSettings.favRooms.splice(favs_i, 1);
                break;
            }
        }

        if (sessionSettings.favRooms.length < 10) {
            $('#favAdd').text("Add");
            $('#favAdd')[0].disabled = false;
        }
    };

    var saveSettings = function () {
        localStorage.setItem(localStorageName, JSON.stringify(getSettings()));
    };

    var loadSettings = function () {
        var storedSettings = JSON.parse(localStorage.getItem(localStorageName));
        if (storedSettings !== null) {
            sessionSettings = storedSettings;
            populateSettings();
        }
    };

    var getSettings = function () {
        return sessionSettings;
    };

    var populateSettings = function () {
        $('#favUserDropList').empty();

        $('#dcRefresh').prop("checked", sessionSettings.autoRefresh);
        $('#refreshTime').val(sessionSettings.refreshSecs);
        $('#canCancelJoining').prop("checked", sessionSettings.canCancel);
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

        if (sessionSettings.joinSession) {
            updateSessionTimer = setInterval(updateSession, 30 * 1000);
        }
    };

    var processAccountEvt = function () {
        var namesToIds = rphToolsModule.getNamesToIds();
        $('#favUserDropList').empty();
        for (var name in namesToIds) {
          addToDroplist(namesToIds[name], name, favUserDropList);
        }
      };

    return {
        init: init,

        getHtml: function () {
            return html;
        },

        toString: function () {
            return 'Session Module';
        },

        processAccountEvt: processAccountEvt,
        getSettings: getSettings,
        updateSession: updateSession,
    };
}());