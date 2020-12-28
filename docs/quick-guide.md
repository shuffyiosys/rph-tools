# RPH Tools Quick Guide
## Chat
### Appearance
The option to color a user's text as they enter messages with their name's basic color is available. 

An option to add padding to the end of messages to increase readibility is also available.

### Pings
This will play an audio cue plus highlight the text color when a message with a trigger word appears in the chat.
1. To use it, make sure "Enable Pings" is toggled ON
1. If you wish to have a browser use a pop-up notification, you can set it to ON
1. Enter the words you want to use as triggers. Separate them by comma, but with no space between them. e.g., ```Alice,Bob,Charlie``` instead of ```Alice, Bob, Charlie```
1. Set the URL where the audio file is. 
1. Enter an HTML compliant color code for the text color. There's no restriction.
1. Enter an HTML compliant color code for the highlight color. There's no restriction.
1. Add matching options to taste. "Exact Match" will only match whole words (e.g., "Mel" only pings on "Mel" and not "Melody"). Case sensitive will take into account using uppercase letters or not (e.g., "Mel" only pings on "Mel" and not "mel")
1. You can enter words in the "Ping Tester" section. Focus away (i.e., click out of it) to test if it triggers a ping or not.

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
* "PM Audio" sets which audio file to play. 
* You can toggle if you want browser notifications on.

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

## Settings
This allows you to import or export your settings.
* Press the "Export" button to display the settings in the text box. Copy and save this somewhere.
* To import settings, enter them into the text box and press the "Import" button.
* If you want to delete your settings and reset them to default, press the "Delete Settings" button twice.

## Behind the scenes stuff
### / Commands
These are commands you can input in the chattext box as a shortcut. The following are supported:
* ``Chat`` /coinflip: Does a coin toss 
* ``Chat & PMs`` /roll [num]d[num]:  Dice roll. If no argument is given, it rolls 1d1000 by default. This will display the totals.
    * Example: /roll 2d6 will roll 2 dices with 6 sides.
* ``Chat`` /random: Generates a random number based on the parameters in the RNG module
* ``Chat`` /kick [username],[reason]: Kicks a person from the chat room with the reason. This must be done with the mod's chat tab selected.
    * Example: /kick Alice,Being rude
* ``Chat`` /ban [username],[reason] - Bans a person from the chat room with the reason (optional). This must be done with the mod's chat tab selected.
    * Example: /ban Bob,Being rude
* ``Chat`` /unban [username],[reason] - Unbans a person from the chat room with the reason (optional). This must be done with the mod's chat tab selected.
    * Example: /unban Bob,Ban period expired
* ``Chat`` /status [message] - Sets the current username's status
    * Example: /status I'm a message!
* ``Chat`` /away [message] - Sets the current username's status and sets it as "Away"
    * Example: /away I'm a message!
    