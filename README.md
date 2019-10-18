# RPH Tools
RPH Tools is a userscript with a set of features to enrich the RPH experience.

***
# How to Install and Update
## Installing RPH Tools
- You must have (one or the other)
  - [Firefox](http://www.getfirefox.com) with the [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) extension.
  - [Google Chrome](https://www.google.com/chrome/) or [Chromium](http://www.chromium.org/Home) with the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) extension installed.
  - [Opera](http://www.opera.com) with either the [Tampermonkey](https://addons.opera.com/en/extensions/details/tampermonkey-beta/?display=en) or [Violentmonkey](https://addons.opera.com/en/extensions/details/violent-monkey/?display=en) extension installed.
- Install using one of these two methods:
  - Go to the [Openuser JS site](https://openuserjs.org/scripts/shuffyiosys/RPH_Tools) and click on the "Install" button on top to add the script.
  - Click on the "Source Code" tab and copy the source code, then...
    - In Greasemonkey, select "Add new script", enter some information then press OK, then paste the code in there. Make sure to save it and enable it.
    - In Tampermonkey, select "Add a new script", then paste the code in there. Press the save icon and enable it.
- Refresh RPH if you're on it already for the script to take effect.

## To update
Go to the [Openuser JS site](https://openuserjs.org/scripts/shuffyiosys/RPH_Tools) and click on the "Install" button on top to update the script. This will overwrite the version you currently have.

***
# Directory structure
RPH Tool features are broken up into modules. These modules use an encapsulation technique that allows them to act like classes/objects. RPH Tools need not care whether a module is actually used or not, save for the main "rph-tools" module.

The files in the ```./src``` folder are main files that are used throughout the script. ```./src/core-modules``` contain the core modules that should live with the script at all times. The file ```./src/core-modules/rph-tools.js``` is the main module that **needs** to live with the script, otherwise it won't work.```./src/feature-modules``` are modules that add features and are considered optional to the script itself.

***
# Building
Since RPH Tools is a collection of JavaScript files, all you need to do is concatenate the files together. While order of concatenation largely doesn't matter, the file ```./src/header.js``` needs to be **first** and ```./src/main.js``` needs to be **last**.

For convenience, three build shell script files are provided with this repo. They are:
- build.bat (Windows CMD)
- build.ps1 (Windows PowerShell)
- build.sh (Linux shell)

***
# License/Disclaimer
See LICENSE file in the source repo.
