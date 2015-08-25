$(function() {
	// Asynchronous
	var tabURL = '';
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function(tabs) {
		// Since there can only be one active tab in one active window, 
		tabURL = tabs[0].url;
		$('#url').text('Current URL: ' + tabURL);
	});

	$("#saveTime").click(function() {
		addTagToDom(tabURL);
	});

	// A function that injects JS into the active tab to get video's current time back
	var addTagToDom = function(url) {
		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video")[0]; v.currentTime'
				// The last call in 'code' gets returned into 'results'
		}, function(results) {
			var time = results[0];
			var description = $('#tagDesc').val();
			if (description !== "") {
				$('#tagDesc').val("");

				// Binds a event click to the list item.
				var tagLink = $("<li>").text(time + " : " + description).attr("id", time);
				tagLink.click(function() {
					var time = $(this).attr('id');
					changeToTime(time);
				});
				$('#tags').append(tagLink);

				// Send this to the server.
				tagJSON = {url: url, time : time, description : description};
				console.log(tagJSON);
				$.post("http://localhost:3000/bestpart", tagJSON);
				
			} else {
				$('#tagDesc').attr("placeholder", "Please enter a tag..");
			}
		});
	};

	// Changes the HTML5 video's time to the one passed in.
	var changeToTime = function(time) {
		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video")[0]; v.currentTime=' + time
		}, function(results) {});
	};
});
