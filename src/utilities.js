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
 * Makes sure the color is less than #DDDDDD or #DDD depending on how many
 * digits were entered.
 * @param {string} TextColor String representation of the color.
 * @return True if the color is within range, false otherwise.
 */
var validateColorRange = function (TextColor) {
    var rawHex = TextColor.substring(1, TextColor.length);
    var validColor = false;
    var red = 255;
    var green = 255;
    var blue = 255;

    /* If the color text is 3 characters, limit it to #DDD */
    if (rawHex.length == 3) {
        red = parseInt(rawHex.substring(0, 1), 16);
        green = parseInt(rawHex.substring(1, 2), 16);
        blue = parseInt(rawHex.substring(2, 3), 16);

        if ((red <= 0xD) && (green <= 0xD) && (blue <= 0xD)) {
            validColor = true;
        }
    }
    /* If the color text is 6 characters, limit it to #DDDDDD */
    else if (rawHex.length == 6) {
        red = parseInt(rawHex.substring(0, 2), 16);
        green = parseInt(rawHex.substring(2, 4), 16);
        blue = parseInt(rawHex.substring(4, 6), 16);
        if ((red <= 0xDD) && (green <= 0xDD) && (blue <= 0xDD)) {
            validColor = true;
        }
    }
    return validColor;
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
    var isMod = false;
    for (var idx = 0; idx < account.users.length && !isMod; idx++) {
        if (room.props.mods.indexOf(account.users[idx]) > -1 ||
            room.props.owners.indexOf(account.users[idx]) > -1) {
            isMod = true;
        }
    }
    return isMod;
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

var makeFullTimeStamp = function(){
    var timeObj = new Date();
    var timestamp = timeObj.getHours().toString().padStart(2, '0') + ':';
    timestamp += timeObj.getMinutes().toString().padStart(2, '0') + ':';
    timestamp += timeObj.getSeconds().toString().padStart(2, '0');

    return timestamp
}
