/******************************************************************************
 * This module handles the "About" section for information on RPH Tools.
 *****************************************************************************/
var aboutModule = (function () {
  var html = {
    'tabId': 'about-module',
    'tabName': 'About',
    'tabContents': '<h3>RPH Tools</h3>' +
      '<p><strong>Version: ' + VERSION_STRING + '</strong></p></br>' +
      '<p>Created by shuffyiosys. Under MIT License (SPDX: MIT). Feel free to modify this code!</p><br />' +
      '<p>If the script isn\'t working, try some <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target="_blank">Troubleshooting Tips</a></p><br />' +
      '<p>Found a problem? <a href="http://www.rphaven.com/topics.php?id=1#topic=1883&page=1" target="_blank">Report it on RPH Forums</a></p><br />' +
      '<p>Grab <a href="https://openuserjs.org/install/shuffyiosys/RPH_Tools.user.js" target="_blank">the latest version</a></p><br />'
  };

  var init = function () {

  };

  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'About Module';
    },
  };
}());
