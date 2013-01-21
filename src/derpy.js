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
		
		var reqUrl = "http://api.derpy.me/v1/shorten.json?url=" + url;
		
		var req = jQuery.get(reqUrl);

		req.done(function(data) {
			var error = false;
			var short, message;
			alert(JSON.stringify(data))
			if(data.success) {
				short = 'http://derpy.me/' + data.data.keyword;
				message = data.success.message;
			} else if(data.error) {
				error = true;
				message = data.error.message;
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
		
		req.fail(function() {
			callback({
				error: true,
				message: req.statusText
			});
			ready();
		});
		
		return true;
	}
})();

function copy(text) {
	elm = document.getElementById("clipboard");
	elm.style.display = "block";
	elm.value = text;
	elm.select();
	document.execCommand("Copy");
	elm.style.display = "none";
}

function onClick() {
	chrome.tabs.getSelected(null,function(tab) {
		derpy(String(tab.url), function(data) {
			if(data.error) {
				alert("Link Failed to Copy" + "\n*Derp*: " + data.message);
			} else {
				copy(data.data);
				alert("Link Coppied\n" + data.message + "\nUrl: " + data.data);
			}
		});
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

chrome.browserAction.onClicked.addListener(onClick);
