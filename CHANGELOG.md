RPH Tools (4.0.7)
--------------
* Added auto-refreshing on detecting the chat socket disconnected
* Updated the sessioning functionality to fix issues
* Sessioning and auto-refreshing are in a new module.

RPH Tools (4.0.6)
--------------
* Fixed a bug with adding room-name pairs to the modding tab.

RPH Tools (4.0.5)
--------------
* Fixed retrieving user IDs out of the account blob since the format changed.

RPH Tools (4.0.4)
--------------
* Added a link to a quick guide in the About module
* Fixed a positioning issue with the user name in the chat tabs.

RPH Tools (4.0.3)
--------------
* Implemented / commands. The following commands have been implemented
  * /coinflip - Does a coin toss
  * /roll [num]d[num] - Dice roll. If no argument is given, it rolls 1d1000 by default
  * /kick [username],[reason] - Kicks a person from the chat room with the reason. This must be done with the mod's chat tab selected.
  * /ban [username],[reason] - Bans a person from the chat room with the reason (optional). This must be done with the mod's chat tab selected.
  * /unban [username],[reason] - Unbans a person from the chat room with the reason (optional). This must be done with the mod's chat tab selected.
  * /color [HTML color] - Changes the text color of the current username
  * /status [message] - Sets the current username's status
  * /away [message] - Sets the current username's status and sets it as "Away"
* Modding Module
  * Changed the delimiter for names from semicolon to comma, since commas are not valid in usernames. Thus they can be used for delimiting.

RPH Tools (4.0.2)
--------------
* Some code was copied, pasted, and modified. So they got moved into their own source file (src/custom.js)
* All build scripts were updated to include src/custom.js
* The rest of the commenting has been updated to JSDoc style
* utilities
  * Removed "clearUsersDroplist" due to redundancy. All calls to it were redone.
* Chat Module
  * Updated room highlighting to use new "Room.isActive()" API
  * Updated populating drop lists for new sorted name to ID array
* PM Module
  * Fixed the layout so it's cleaner
  * Updated populating drop lists for new sorted name to ID array
* Modding Module
  * Cleaned up the mod action button positions
  * Renamed "resetPassword" to "resetPwButton"
* Settings Module
  * Cleaned up the button positions
* RPH Tools module
  * Added "namesToIds" dictionary. This maps the account's usernames to their ID values.

RPH Tools (4.0.1)
--------------
* Most comments were updated to JSDoc style (still need to do the chat and utilities files)
* Fixed chat tab resizing in the Chat module
* Updated dice limits to up 100d1000 in the RNG module
* Added "Owner" and "Unowner" buttons to the Modding module
* Removed "printSettings" function in the Settings module
* Added shameless plug to the repo in the About module :)

RPH Tools (4.0.0)
--------------
* RPH Tools was overhauled to be compatible with RPH's changes in 2018. Almost all features of versions prior were kept. History older than 4.0.0 can be found at the old repo. Some changes were made though.
* General
  * UI elements were expanded to take advantage of the larger area
* Chat Section
  * Added a preview area for text color and pings due to the modal window nature of where things are. This is so things can be tested without being in a chat room.
  * Removed the "Chat History" in "Other Options" since this is provided natively.
* Random number generators
  * All modes are provided rather than using a ad-hoc tab system
* Modding section
  * Users no longer have to enter the room as a mod name to get the "Room-Name Pair" field to populate. The script will see if one of account's usernames is a mod or owner when the user enters the room.
  * "Auto kick" was removed. This feature may not have been used all that much or was very useful (at least in its implementation)
