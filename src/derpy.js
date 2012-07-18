/* Derpy.js, url shortener code. requires jquery > 1.6?*/


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
		
		var reqUrl = "http://derpy.me/?url=" + url;
		
		var req = jQuery.get(reqUrl);

		req.done(function(data) {
			var error = false;
			try {
				//jQuery is WIN
				var url =  $(".shortlink", data)[0].getElementsByTagName('a')[0].href;
			} catch(err) {
				error = err;
			}
			callback(error, url);
			finish();
		});
		
		req.fail(function() {
			callback(req.statusText);
			ready();
		});
		
		return true;
	}
})();
