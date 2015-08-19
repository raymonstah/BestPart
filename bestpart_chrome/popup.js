$(function() {
	// Asynchronous
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function(tabs) {
		// Since there can only be one active tab in one active window, 
		var tabURL = tabs[0].url;
		$('#url').text('Current URL: ' + tabURL);
	});

	$("#saveTime").click(function() {
		addTagToDom();
	});

	// A function that injects JS into the active tab to get video's current time back
	var addTagToDom = function() {
		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video")[0]; v.currentTime'
				// The last call in 'code' gets returned into 'results'
		}, function(results) {
			// Check errors
			if (chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError.message);
			}

			var description = $('#tagDesc').val();
			if (description !== "") {
				$('#tagDesc').val("");

				// Binds a event click to the list item.
				var tagLink = $("<li>").text(results + " : " + description).attr("id", results);
				tagLink.click(function () {
					var time = $(this).attr('id');
					changeToTime(time);
				});
				$('#tags').append(tagLink);
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