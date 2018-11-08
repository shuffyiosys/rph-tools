# RPH Tools Quick Guide
## Chat
### Color changing
This will change the text color of the selected username.
1. Select the user name whose color you want to change from the drop down
2. Enter an HTML compliant color code. This is in the form of a number sign (#) followed by 3 or 6 digits from 0-9, A-F (hex values). Note in order to prevent really hard to read text colors, the limit is set to #DDD for 3 digit codes and #D2D2D2 for 6 digit codes.
3. A preview can be seen so you don't have to send it and adjust to taste
4. Press the "Set color" button when you want to change the text color. You may have to send it a few times.

### Pings
This will play an audio cue plus highlight the text color when a message with a trigger word appears in the chat.
1. Enter the words you want to use as triggers. Separate them by comma, but with no space between them. e.g., ```Alice,Bob,Charlie``` instead of ```Alice, Bob, Charlie```
2. Set the URL where the audio file is. It must be a .wav, .mp3, or .ogg.
3. Enter an HTML compliant color code for the text color. There's no restriction.
4. Enter an HTML compliant color code for the highlight color. There's no restriction.
5. Add matching options to taste. "Exact Match" will only match whole words (e.g., "Mel" only pings on "Mel" and not "Melody"). Case sensitive will take into account using uppercase letters or not (e.g., "Mel" only pings on "Mel" and not "mel")
6. You can enter words in the "Ping Tester" section. Focus away (i.e., click out of it) to test if it triggers a ping or not.

### Flood Filtering
This will monitor user messages and filter them out if the script detects they are attempting to flood/spam the room. Various strength levels can be used.

## Sessions
### Auto-Refresh
This will refresh the page for you automatically when the script detects a disconnect event happens. It doesn't happen immediately, but after a delay. In addition, this will automatically re-join the rooms you were in.
* Refresh on Disconnect, when checked, will cause the script to automatically refresh after the timeout.
* Auto-Refresh time is the delay, in seconds, when a disconnect is detected to when the refresh happens. This can be set between 5-60 seconds.

This feature has a retry mechanism in that it will retry 5 times before giving up. The retry mechanism will reset if you have been on for more than 10 minutes without disconnecting.

### Auto Joining
This auto joins rooms that you put into it whenever you log in.
1. Set the options
    * "Can Cancel" means you can cancel auto joining if you don't want the system to.
    * "Join Favorites" joins all of the rooms in the favorites list
    * "Always join last session" keeps track of what rooms you were in and automatically joins them when you refresh the chat. This has no effect on Auto-Refresh.
2. To enter a favorite room:
    1. Select a username from the dropdown menu
    2. Enter the room name
    3. Enter the room's password, if any
    4. Press the "Add" button
    5. To remove a favorite room, select it on the list and press the "Remove" button

## PMs
### PM Away System
This sets up an auto-reply system in case you're away. To use:
1. Select a username from the list
2. Type in a message
3. Press the "Enable" button.
4. Press the "Disable" when you're done.
 
### Other Settings
* "PM Audio" sets which audio file to play. This is an URL and it must lead to a HTML5 compliant audio container (wav, mp3, or ogg are safe bets)
* "Mute PMs" if you don't want PM audio pings
* "No image icons" prevents links to small images from being replaced by said image.

## Random Numbers
Generates a random number to send to the chat.
* Coin toss: simple heads or tails generator
* Dice Role: Rolls the specificed number of dice of a specified number of sides. An option to calculate the totals is avaialble.
* General RNG: Generates a random number between a range.

## Blocking
Forces blocking on the client side to drop messages from ignored users. To use:
1. Type in a name in the "User" textbox
2. Press the "Block" button to block them
3. To unblock them, select their name in the list and press the "Unblock" button

## Modding
A set of tools to aid in moderating a room. Note this only works if you are actually a moderator and you own the username. To use:
1. Enter a username-room pair, if populated. When you join a room, the script automatically figures out if one of your usernames is a moderator and populates this list. This populates the "Room" and "Mod Name" fields. Use the "<Blank out fields>" option to blank "Room" and "Mod Name"
2. Otherwise enter a room name
3. Enter the username that's a mod of that room
4. Enter a message why the action was done
5. A list of names to perform the action on. This is comma separated with no spaces in between. e.g., ```Alice,Bob,Charlie``` instead of ```Alice, Bob, Charlie```
6. Press one of the action buttons to perform the action.
7. Note "Reset PW" is to reset the chat room's password if you forgot it.

### Word Alerter
This is to help mods track certain words that people in the chatroom shouldn't say. To use:
1. Enter the words or phrases in the text field, separated by a pipe (|) without spaces in between.
2. To disable this feature, empty out the text box.

### Auto-kick and Auto-Ban
This will automatically kick or ban a user based on the phrases in the text box.
1. Enter the words or phrases in the text field, separated by a pipe (|) without spaces in between.
2. To disable this feature, empty out the text box.

### Perform mod action on flooding
If filter flooding is enabled, then when flooding is detected, an action can be performed as well.
1. Set the action to do when flooding is detected.

## Settings
This allows you to import or export your settings.
* Press the "Export" button to display the settings in the text box. Copy and save this somewhere.
* To import settings, enter them into the text box and press the "Import" button.
* If you want to delete your settings and reset them to default, press the "Delete Settings" button twice.

## Behind the scenes stuff
### / Commands
These are commands you can input in the chattext box as a shortcut. The following are supported:
* /coinflip - Does a coin toss
* /roll [num]d[num] - Dice roll. If no argument is given, it rolls 1d1000 by default. This will display the totals.
    * Example: /roll 2d6 will roll 2 dices with 6 sides.
* /kick [username],[reason] - Kicks a person from the chat room with the reason. This must be done with the mod's chat tab selected.
    * Example: /kick Alice,Being rude
* /ban [username],[reason] - Bans a person from the chat room with the reason (optional). This must be done with the mod's chat tab selected.
    * Example: /ban Bob,Being rude
* /unban [username],[reason] - Unbans a person from the chat room with the reason (optional). This must be done with the mod's chat tab selected.
    * Example: /unban Bob,Ban period expired
* /color [HTML color] - Changes the text color of the current username
    * Example: /color #123
* /status [message] - Sets the current username's status
    * Example: /status I'm a message!
* /away [message] - Sets the current username's status and sets it as "Away"
    * Example: /away I'm a message!
    