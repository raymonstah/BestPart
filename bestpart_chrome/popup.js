$(document).ready(function() {
	// This is for YouTube
	$("#saveTime").click(function() {
		// Asynchronous
		chrome.tabs.query({
			active: true,
			lastFocusedWindow: true
		}, function(tabs) {
			// Since there can only be one active tab in one active window, 
			var tabURL = tabs[0].url;
			$('#url').text('Current URL: ' + tabURL);
			getCurrentTime();
		});
	});


	// A function that injects JS into the active tab to get video's current time back
	var getCurrentTime = function() {
		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video")[0]; v.currentTime'
				// The last call in 'code' gets returned into 'results'
		}, function(results) {
			// Check errors
			if (chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError.message);
			}
			$('#currentTime').text("Current time is: " + results);
		});
	}
});