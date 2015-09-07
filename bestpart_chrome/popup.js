// Raymond Ho
// 8/22/15


// The main module in charge of creating and adding tags.
var TagModule = {

	votingHTML: '<span><a href="#" class="img-upvote"><img src="thumbs-up.png" alt=""></a><span class="vote-count">9999</span><a href="#" class="img-downvote"><img src="thumbs-down.png"></a></span>',

	createNewTag: function(url) {
		var tm = this;

		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video")[0]; v.currentTime'
				// The last call in 'code' gets returned into 'results'
		}, function(results) {
			var time = results[0];
			var description = $('#tagDesc').val();
			if (description !== "") {
				$('#tagDesc').val("");
				tm.addTagToDom(time, description, 0);
				ServerModule.sendTagToServer(url, time, description);

			} else {
				$('#tagDesc').attr("placeholder", "Please enter a tag..");
			}
		});
	},

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

// Controls interaction with server-side.
var ServerModule = {
	HOSTURL: 'http://localhost:3000/bestpart/',

	getTagsFromServer: function(videoURL) {
		$.get(this.HOSTURL + "gettags", {
			url: videoURL
		}, function(data) {
			if (data.error) {
				$('#message').text("No tags found! Create some!");
			} else {
				var tags = data.tags;
				tags.forEach(function(tag, index) {
					console.log(tag);
					var time = tag.tag_time;
					var description = tag.tag_description;
					var score = tag.tag_score;
					TagModule.addTagToDom(time, description, score);
				});
			}
		});
	},

	sendTagToServer: function(url, time, description) {
		// Send this to the server.
		tagJSON = {
			url: url,
			time: time,
			description: description
		};
		$.post(this.HOSTURL + "tag", tagJSON);
	},
}

$(function() {

	var tabURL = '';

	// Get the active Chrome tab and its URL.
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function(tabs) {
		// Since there can only be one active tab in one active window, 
		tabURL = tabs[0].url;
		$('#url').text('Current URL: ' + tabURL);
		ServerModule.getTagsFromServer(tabURL);
	});

	$("#saveTime").click(function() {
		TagModule.createNewTag(tabURL);
	});
});
