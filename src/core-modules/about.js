/**
 * This module handles the "About" section for information on RPH Tools.
 */
let aboutModule = (function () {
	let html = {
		'tabId': 'about-module',
		'tabName': 'About',
		'tabContents': '<h3>RPH Tools</h3><br>' +
			'<p><strong>Version: ' + VERSION_STRING + '</strong>' +
			' | <a href="https://openuserjs.org/install/shuffyiosys/RPH_Tools.user.js" target="_blank">Install the latest version</a>' +
			' | <a href="https://github.com/shuffyiosys/rph-tools/blob/master/CHANGELOG.md" target="_blank">Version history</a>' +
			' | <a href="https://discord.gg/HBEaGjs" target="_blank">Discord channel</a>' + 
			' | <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools" target="_blank">OpenUserJs page</a>' +
			'</p></br>' +
			'<p>Created by shuffyiosys. Under MIT License (SPDX: MIT). Feel free to make contributions to <a href="https://github.com/shuffyiosys/rph-tools" target="_blank">the repo</a>!</p><br />' +
			'<p><a href="https://github.com/shuffyiosys/rph-tools/blob/master/docs/quick-guide.md" target="_blank">Quick guide to using RPH Tools</a></p></br>'
	}

	function init() {
		return;
	}

	function getHtml() {
		return html;
	}

	function toString() {
		return 'About Module';
	}

	return {
		init: init,
		getHtml: getHtml,
		toString: toString
	}
}());