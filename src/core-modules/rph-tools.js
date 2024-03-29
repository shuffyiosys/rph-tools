/**
 * Main RPH Tools module
 */
let rphToolsModule = (function () {
	let modules = [];

	let rpht_css =
		"<style>" +
		"#settings-dialog .inner > div > div.rpht-option-block{width:640px;border:#888 solid 1px;border-radius:10px;padding:12px;padding-top:16px;padding-bottom:16px;margin-bottom:16px;}" +
		".rpht-option-section{border-bottom:#444 solid 1px;padding-bottom:12px;margin-bottom:12px;}" +
		".option-section-bottom{border-bottom:none;margin-bottom:0;}" +
		".rpht-label{padding-left: 0px;text-align:justify;display:inline-block;cursor:default;}" +
		".checkbox-label{font-weight:700;width:542px;cursor:pointer;}" +
		".descript-label{width:480px;margin-top:8px;}" +
		".text-input-label{width:400px;}" +
		".split-input-label {width: 300px;}" +
		".rpht_textarea{border:1px solid #000;width:611px;padding:2px;background:#e6e3df;}" +
		".rpht_chat_tab{height:54px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;}" +
		".rpht-checkbox{height:16px;width:16px;}" +
		"input.rpht-short-input{width:200px;}" +
		"input.rpht-long-input{max-width:100%;}" +
		".msg-padding{line-height: 1.25em}" +
		".switch{position:relative;right:12px;width:50px;height:24px;float:right;}" +
		".switch input{opacity:0;width:0;height:0;}" +
		".rpht-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;-webkit-transition:.4s;transition:.4s}" +
		'.rpht-slider:before{position:absolute;content:"";height:16px;width:16px;left:4px;bottom:4px;background-color:#fff;-webkit-transition:.4s;transition:.4s}' +
		"input:checked+.rpht-slider{background-color:#2196f3}" +
		"input:focus+.rpht-slider{box-shadow:0 0 1px #2196f3}" +
		"input:checked+.rpht-slider:before{transform:translateX(26px)}" +
		".rpht-slider.round{border-radius:34px}" +
		".rpht-slider.round:before{border-radius:50%}" +
		".rpht-tooltip-common{position: absolute; bottom: 120px; left: 200px; width: auto; height: auto; color: #dedbd9; background: #303235; opacity: 0.9; padding: 10px;}" +
		".rpht-cmd-tooltip{width: 800px; height: auto;}" +
		".rpht-cmd-tooltip:hover{opacity: 0;}" +
		".rpht-die-label{text-align: right; display: inline-block; width: 74px; margin-right: 7px;}" +
		".rpht-die-updown{width: 60px; min-width: 0px;}" +
		".rpht-close-btn{margin-left: 40px; width: 24px; cursor: pointer;}" +
		".rpht-close-btn:hover{background: #CA7169;}" +
		"#diceRollerPopup button{width: 146px;}" +
		"</style>";

	/**
	 * Initializes the modules and the HTML elements it handles.
	 * @param {Array} addonModules Modules to add into the system.
	 */
	function init(addonModules) {
		let $settingsDialog = $("#settings-dialog");
		modules = addonModules;

		if (Notification.permission !== "denied") {
			Notification.requestPermission();
		}

		$("head").append(rpht_css);
		$("#settings-dialog .inner ul.tabs").append("<h3>RPH Tools</h3>");

		/* Checks to see if there's a local store for settings and creates one
		 * if there isn't. */
		let settings = localStorage.getItem(SETTINGS_NAME);
		if (!settings) {
			settings = {};
			localStorage.setItem(SETTINGS_NAME, JSON.stringify(settings));
		}

		modules.forEach(function (module) {
			if (module.getHtml) {
				html = module.getHtml();
				$("#settings-dialog .inner ul.tabs").append(
					'<li><a href="#' + html.tabId + '">' + html.tabName + "</a></li>"
				);
				$("#settings-dialog .inner div.content div.inner").append(
					'<div id="' + html.tabId + '" style="display: none;">' + html.tabContents + "</div>"
				);

				$settingsDialog.find('.tabs a[href="#' + html.tabId + '"]').click(function (ev) {
					$settingsDialog.find(".content .inner > div").hide();
					$settingsDialog.find($(this).attr("href")).show();
					ev.preventDefault();
				});

				module.init();
			}
		});
	}

	/**
	 * Returns a module based on a name passed in.
	 * @param {string} name Name of the module to get the data
	 * @returns Returns the module, if found. Otherwise returns null.
	 */
	let getModule = function (name) {
		let module = null;
		for (let i = 0; i < modules.length; i++) {
			if (modules[i].toString() === name) {
				module = modules[i];
				break;
			}
		}
		return module;
	};

	function getAllModules() {
		return modules;
	}

	function getHtml() {
		return html;
	}

	function toString() {
		return "RPH Tools Module";
	}

	return {
		init: init,
		getModule: getModule,
		getAllModules: getAllModules,
		getHtml: getHtml,
		toString: toString,
	};
})();
