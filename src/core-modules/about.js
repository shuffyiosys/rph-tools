/**
 * This module handles the "About" section for information on RPH Tools.
 */
var aboutModule = (function () {
	var html = {
		'tabId': 'about-module',
		'tabName': 'About',
		'tabContents': '<h3>RPH Tools</h3><br>' +
			'<p><strong>Version: ' + VERSION_STRING + '</strong>' +
			' | <a href="https://github.com/shuffyiosys/rph-tools/blob/master/CHANGELOG.md" target="_blank">Version history</a>' +
			' | <a href="https://openuserjs.org/install/shuffyiosys/RPH_Tools.user.js" target="_blank">Install the latest version</a>' +
			'</p></br>' +
			'<p>Created by shuffyiosys. Under MIT License (SPDX: MIT). Feel free to make contributions to <a href="https://github.com/shuffyiosys/rph-tools" target="_blank">the repo</a>!</p><br />' +
			'<p><a href="https://github.com/shuffyiosys/rph-tools/blob/master/docs/quick-guide.md" target="_blank">Quick guide to using RPH Tools</a></p></br>' +
			'<p>If the script isn\'t working, try some <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target="_blank">Troubleshooting Tips</a></p><br />'
	}

	function init() {
		return
	}

	function getHtml() {
		return html
	}

	function toString() {
		return 'About Module'
	}

	return {
		init: init,
		getHtml: getHtml,
		toString: toString
	}
}());