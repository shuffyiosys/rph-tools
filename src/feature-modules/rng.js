/** 
 * Random number generator module. This is mostly used for chance games that
 * can happen in the chat
 */
var rngModule = (function () {
    var DIE_MIN = 1;
    var DIE_MAX = 100;
    var DIE_SIDE_MIN = 2;
    var DIE_SIDE_MAX = 100;
    var RNG_NUM_MIN = -10000000000000;
    var RNG_NUM_MAX = 10000000000000;

    var html = {
        'tabId': 'rng-module',
        'tabName': 'Random Numbers',
        'tabContents': '<h3>Random Number Generators</h3>' +
            '<div>' +
            '<h4>Shortcuts</h4><br />' +
            '<p>/coinflip - Does a coin toss</p>' +
            '<p>/roll [num]d[num] - Dice roll. If no argument is given, it rolls 1d1000. Example: /roll 2d6 will roll 2 dices with 6 sides</p>' +
            '</div>' +
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
        /* Cap the values, just in case. */
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