// Raymond Ho
// 8/22/15


var TagModule = {

	votingHTML: '<span><a href="#" class="img-upvote"><img src="thumbs-up.png" alt=""></a><span class="vote-count">9999</span><a href="#" class="img-downvote"><img src="thumbs-down.png"></a></span>',

	// Manipulates the DOM by adding a tag as a list item.
	addTagToDom: function(time, description, score) {
		console.log(time, description, score);
		// Binds a event click to the list item.
		var tm = this;
		var tagLink = $("<li>")
			.text(this.convertTime(time) + " : " + description)
			.attr("id", time)
			.append(this.votingHTML)
			.click(function() {
				var time = $(this).attr('id');
				tm.changeToTime(time);
			});

		$('#tags').append(tagLink);
	},

	// Changes the HTML5 video's time to the one passed in.
	changeToTime: function(time) {
		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video")[0]; v.currentTime=' + time
		}, function(results) {});
	},

	// Converts seconds to Hours, Minutes, Seconds
	convertTime: function(d) {
		d = Number(d);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
	}
}

$(function() {

	var HOSTURL = 'http://localhost:3000/bestpart/';

	var tabURL = '';
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function(tabs) {
		// Since there can only be one active tab in one active window, 
		tabURL = tabs[0].url;
		$('#url').text('Current URL: ' + tabURL);
		// Load the video's tags..
		$.get(HOSTURL + "gettags", {
			url: tabURL
		}, function(data) {
			console.log(data);
			if (data.error) {
				$('#message').text("No tags found! Create some!");
			} else {
				var tags = data.tags;
				tags.forEach(function(tag, index) {
					console.log(tag);
					var time = tag.tag_time;
					var score = tag.tag_score;
					var description = tag.tag_description;
					TagModule.addTagToDom(time, description, score);
				});
			}
		});
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
			var timeString = secondsToHms(time);
			var description = $('#tagDesc').val();
			if (description !== "") {
				$('#tagDesc').val("");
				// Binds a event click to the list item.
				var tagLink = $("<li>")
					.text(timeString + " : " + description).attr("id", time);
				tagLink.click(function() {
					var time = $(this).attr('id');
					changeToTime(time);
				});
				$('#tags').append(tagLink);

				// Send this to the server.
				tagJSON = {
					url: url,
					time: time,
					description: description
				};
				$.post(HOSTURL + "tag", tagJSON);

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

	var secondsToHms = function(d) {
		d = Number(d);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
	}
});