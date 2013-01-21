/* Derpy.js, url shortener code */

window.derpy = (function() {
	
	var busy = false;
	var timeout = NaN;
	
	function call(func) {
		if(typeof(func) == 'function')
			func();
	}
	
	function ready() {
		busy = false;
		call(window.derpy.ready)
		clearTimeout(timeout);
	}

	function start() {
		busy = true;
		call(window.derpy.start)
		timeout = setTimeout(function() {
			ready();
		}, 60000);
	}

	function finish() {
		call(window.derpy.finish)
	}
	
	//ten second timeout seems ok
	jQuery.ajaxSetup({ timeout: "10000" });
	
	return function(url, callback) {
		if(busy) return false;
		start();
		url = encodeURIComponent(url);
		
		var apiTarget = "http://api.derpy.me/v1/shorten.json?url=" + url;
		var request = jQuery.get(apiTarget);

		request.done(function(data) {
			var error = false;
			var short, message;
			if(data.success) {
				short = 'http://derpy.me/' + data.data.keyword;
				message = data.success.message;
			} else if(data.error) {
				error = true;
				message = data.error.message;
				alert(message);
			} else {
				error = true;
				message = 'Malformed response';
			}
			
			callback({
				error: error,
				data: short,
				message: message
			});
			finish();
		});
		
		request.fail(function() {
			callback({
				error: true,
				message: request.statusText
			});
			ready();
		});
		
		return true;
	}
})();

function shortenURL() {
	chrome.tabs.getSelected(null,function(tab) {
		try {
			derpy(String(tab.url), function(error, url, message) {
				if(error) {
					$("#statusimg").src = "img/icon16_dim.png";
					$("input[name=shortlink]").value = "*Derp*: " + message;
				} else {
					$("#statusimg").src = "img/icon16.png";
					$("input[name=shortlink]").value = url;
					$("input[name=shortlink]").select();
					document.execCommand("Copy");
				}
			});
		} catch (error) {
			$("#statusimg").src = "img/icon16_dim.png";
			$("input[name=shortlink]").value = "*Derp*: " + error;
		}
	});
};
window.derpy.start = function() {
	chrome.browserAction.setIcon({path:"img/icon16_dim.png"});
}

window.derpy.finish = function() {
	chrome.browserAction.setIcon({path:"img/icon16_light.png"});
}

window.derpy.ready = function() {
	chrome.browserAction.setIcon({path:"img/icon16.png"});
}

document.addEventListener('DOMContentLoaded', function () {
  shortenURL();
});
