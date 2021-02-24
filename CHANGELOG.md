RPH Tools (4.3.8)
---------------
##### Feature Updates
* Combined the coloring options by allowing no color, speech highlighting (this is the default), and simple coloring
* Removed the option to stylize with multiple colors if the user has that set
* Added back the option to hide the command window
* Room management window's layout uses a side-by-side layout, with the group's page on the left and the management settings on the right

RPH Tools (4.3.7)
---------------
##### Feature Updates
* Timestamps are now in numerical format (e.g., December 20 now shows as 12/20)
  * This does not work on PMs if retrieved from logs
* ~~Padding between chat messages is larger~~
* Removed the option to disable the command window, as it was a kludge to fix problems with hiding it
* Custom ping and PM sounds overwrite RPH's system sounds
* Removed option to mute PM sounds, as there are other ways to do this (e.g., mute the tab or set the option in RPH itself)
* Added an option to highlight chat tabs with unread messages or not, using a simple marker or RPH's default

##### Bug Fixes
* Fixed the CSS rules for the chat tabs area to show the scrollbar if the width of the area is smaller than main section
* Fixed an issue setting the indicator on a chat tab when an unfocused room gets a new message

#### Miscellaneous Fixes
* Removed the audio tag added in 4.3.6 since this was fixed on the site itself

RPH Tools (4.3.6)
---------------
##### Bug Fixes
* Fixed issues with slash command parsing

#### Miscellaneous Fixes
* Added a missing <audio> tag for PM sound and have the script play it back. This will be removed if the site fixes this.

RPH Tools (4.3.5)
---------------
##### Features Updates
* Added sessions. When enabled, this will automatically join the last rooms you were in when reloading the chat.
* Reworked how chat messages are processed so there's only one handler, rather than per-chat-tab. This should improve performance.
* The area to the left of the chat text box now has a fixed width. This is to prevent issues were the character name + room name overflows, causing the dice button to become hidden.

##### Bug Fixes
* Fixed the alert word feature of the mod section.
* Fixed an issue where if you imported bad settings, the box would remain red if you exported them. The box will clear when exporting settings.

RPH Tools (4.3.4)
---------------
##### Bug Fixes
* Used a different CSS property to hide the command window when hovered, due to a strange interaction between jQuery's hide/show function and the property ``display:none``
* Fixed an issue where multiple user-left-room triggers still happen.

RPH Tools (4.3.3)
---------------
##### Features Updates
* Made the command window disappear if hovered over.
* Ping tester checks on each input, rather than when focusing somewhere else
* Self-pinging is turned off by default
* Added user leaving room filtering to suppress multiple triggers from the server (until it gets fixed)

RPH Tools (4.3.2)
---------------
##### Bug Fixes
* Fixed an issue where if pinged in an actively watched room, the room highlight affects the first non-actively watched room.

RPH Tools (4.3.1)
---------------
##### Bug Fixes
* Fixed the added new line in posts (it's fixed now, I promise!)

RPH Tools (4.3.0)
---------------
##### Features Updates
* Revised the RNG to something that's more fair. Based on the [Park-Miller-Carta PRNG](http://www.firstpr.com.au/dsp/rand31/). As a result, older versions are no longer compatible.
* Added an RNG mini-window. This is accessible through a dice button next to the chat input text box.

##### Bug Fixes
* ~~Fixed the added new line in posts~~
* When exiting a room, made the command window close as well. This applies to the new dice roller window too.

RPH Tools (4.2.10)
---------------
##### Features Updates
* Expanded dice roll command explanation in the command window. Got rid of the "hover for lower opacity" CSS rule (window is now 90% opaque all the time)

##### Bug Fixes
* The server update in 2/29/2020 caused various issues, so a lot of these are to address them.
* Fixed the ping preview so that it uses the actual ping settings.
* Fixed highlighting rooms when pinged
* ~~Fixed an issue where in chat, messages were posted with an extra blank line.~~
* Fixed formatting in the PM message processing so normal messages now have a colon after the username.

RPH Tools (4.2.9)
---------------
##### Bug Fixes
* Replaces the ``makeSafeForCss`` method, which was removed, for a substitute where used.

RPH Tools (4.2.8)
---------------
##### Features Updates
* Command window hides when inputting something after the first space.

RPH Tools (4.2.7)
---------------
##### Features Updates
* Command window automatically filters based on what you type
* Browser notifications trigger only if you do not have the tab active

RPH Tools (4.2.6)
---------------
##### Features Updates
* Added a slash (/) command window that pops up if the first character in the chat room textbox is /
* Changed the RNG system so that it's only available via slash (/) commands
* RNG module is no longer available since the current random numbers work differently.

##### Bug fixes
* Fixed a bug that highlighted inactive rooms regardless when a chat message came in
* Fixed a bug that was causing simple coloring to not work

#### Known issues
* [CANNOT FIX] If a message comes up from a backlog such as going into a room or PM history restore, RPH Tools cannot process RNG commands. For chat commands, this is because RPH sends groups of messages with the same timestamp, which is used as the seed for the RNG. For PMs, it's because they are auto-filled by your computer's local history and there's no obvious trigger that RPH Tools can pick up on to process past results.
  * [ADDENDUM] RPH Tools will process RNG commands in the chat if it's the first message in a bundle, as the seed is valid for that. Otherwise it ignores the others.

RPH Tools (4.2.5)
---------------
##### Bug fixes and features
* New chat and PM processing to be compatible with RPH's native Edit message and Dice Roll commands.
* Re-instated PM Away (not sure why this got lost D:)
* Added option for chat message text coloring to add a user's complete color style or just their primary one
##### Known issues
* Cannot process RPH's edits at the moment. This will invalidate any RNG commands if used.

RPH Tools (4.2.4)
---------------
* Quick patches to get RPH Tools working on PMs and Chat

RPH Tools (4.2.3)
---------------
* Fixed an issue with chat and PM slash commands.

RPH Tools (4.2.2)
---------------
* Added a tell on the chat tab that isn't active and new messages showed up
* Increased padding for chat messages
* Added an option for pings to not trigger if a person would've triggered their own pings
* Added /coinflip and /rps as PM command options
* Actually added desktop notifications for PMs
* Various bug fixes

RPH Tools (4.2.1)
---------------
* Changed how chat message processing works
* Colorize chat messages is on by default now

RPH Tools (4.2.0)
---------------
* Overhaul of the UI. All checkboxes are toggle switches now, and most options have descriptive text explanaing what that option does.
* Added option to toggle user colors in chat or PMs
* Added the option to show browser notifications when pinged in Chat or when receiving a PM.
* Added option to pad out messages in the chat room
* Added option to separate messages as they come in, or combine them by user and time
* Added a command processor to PMs. So far only `/roll` is supported
* Removed the Session module, as RPH's Socket.IO auto-reconnects. Favorite Rooms were moved to the Chat Module
* Removed the Blocking module, as RPH's seems to work

RPH Tools (4.1.8)
---------------
* Added Rock, Paper, Scissors command

RPH Tools (4.1.7)
---------------
* General code clean up
* Removed the color picker, as it can break the color settings for the user.
* Fixed an issue getting the accounts usernames populated in various places.
* Fixed an issue with the mod-room pairing logic to keep from triggering if a mod enters with a non-mod alt

RPH Tools (4.1.6)
--------------
* Changed the RNG's LCG parameters as the values used were too large for JavaScript to compute correctly

RPH Tools (4.1.5)
--------------
* Modified the RNG so that the receivers generate the final number. This adds on the older RNG method, making this backwards compatible, but not forwards compatible.

RPH Tools (4.1.4)
--------------
* Changed the default blank /roll parameters to do a 1d20 due to the frequency of people using that
* Fixed a problem with using the up/down arrows to recall input history. It will now only switch if the cursor is at the beginning of the textbox for pressing up and at the end for pressing down.

RPH Tools (4.1.3)
--------------
* Fixed the color picker as RPH now expects colors without the "#"

RPH Tools (4.1.2)
--------------
* Added a basic chat history function as RPH has a habit of eating messages now.

RPH Tools (4.1.1)
--------------
* (history was lost here, unfortunately)

RPH Tools (4.1.0)
--------------
* Redid the settings store system. Everything is now under the same localstore key, rather than each module having its own key. This should help simplify settings management. However, this makes it incompatible with settings before this version.
* Added PM and Chat textbox input saving and restoring. There are some caveats:
  * Chatbox textbox inputs will only be restored if both the character rejoins the room. 
  * PM textbox inputs will be out of sync if a PM session was started but the PM was not sent. It depends on what the RPH servers send over.
* Removed spam filtering since it's not needed anymore.
* Removed auto-modding features

RPH Tools (4.0.10)
--------------
* Added a verification check to RNG rolls. It now includes a basic hashing function that gets verified on clients that receive it. This however, invalidates the older RNG verification method.

RPH Tools (4.0.9)
--------------
* Fixed the auto-kick and ban if-conditions. 
* Straightened out the GUI

RPH Tools (4.0.8)
--------------
* Defaulted all unsupported slash commands to RPH's handler.
* Auto-refresh system will only work for five attempts now. After trying five times, it will require manual refreshing. If the user's connection is stable for 10 minutes, auto-refresh will start working again.
  * This can be overriden by importing settings.
* For certain actions, the slash commands were added to the page to make it more obvious they exist.

RPH Tools (4.0.7)
--------------
* Added auto-refreshing on detecting the chat socket disconnected
* Updated the sessioning functionality to fix issues
* Sessioning and auto-refreshing are in a new module.
* Added a timer to dismiss the splash window when rooms are available.

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
