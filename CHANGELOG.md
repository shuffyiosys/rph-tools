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