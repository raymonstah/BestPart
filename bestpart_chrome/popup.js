$(document).ready(function() {
	// This is for YouTube
	$("#saveTime").click(function(){
		// Returns the player time in seconds (not so accurate)
		// var currentTime = $('#movie_player').getCurrentTime();
		// This is how you set the time
		//$('#movie_player').seekTo(currentTime, true);

		// Asynchronous
		chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
			// Since there can only be one active tab in one active window, 
			var tabURL = tabs[0].url;
			$('#url').text(tabURL);
			var message = document.querySelector('#message');
			console.log(tabs[0]);
			chrome.tabs.executeScript(null, {
				code: "getPagesSource.js"
			}, function() {
				// If you try and inject into an extensions page or the webstore/NTP you'll get an error
				if (chrome.runtime.lastError) {
					message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
				}
			});
		});
	}); 
});

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    message.innerText = request.source;
  }
});
