// Raymond Ho
// 8/22/15


// The main module in charge of creating and adding tags.
var TagModule = {

	votingHTML: '<span><a href="#" class="img-upvote"><img src="thumbs-up.png" alt=""></a><span class="vote-count">0</span><a href="#" class="img-downvote"><img src="thumbs-down.png"></a></span>',

	createNewTag: function(url, description) {
		var tm = this;

		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video")[0]; v.currentTime'
				// The last call in 'code' gets returned into 'results'
		}, function(results) {
			var time = results[0];
			tm.addTagToDom(time, description, 0);
			ServerModule.sendTagToServer(url, time, description);
		});
	},

	// Manipulates the DOM by adding a tag as a list item.
	addTagToDom: function(time, description, score) {
		// Binds a event click to the list item.
		var tm = this;
		var tagLink = $("<li>")
			.append($("<a>")
				.attr("href", "#")
				.text(this.convertTime(time) + " : " + description)
				.click(function() {
					var time = tagLink.attr('data-time');
					tm.changeToTime(time);
				}))
			.attr("data-time", time)
			.append(this.votingHTML);
		$('#tags').append(tagLink);

		this.invokeVotingListener();
	},

	// Handles the events for when a user votes on a tag.
	invokeVotingListener: function() {
		var handleVoting = function(selector, i) {
			var counterSelector = selector.siblings('.vote-count');
			var votes = Number(counterSelector.text()) + i;
			counterSelector.text(votes);
		};

		$('.img-upvote').click(function() {
			handleVoting($(this), 1);
		});

		$('.img-downvote').click(function() {
			handleVoting($(this), -1);
		});
	},

	// Changes the HTML5 video's time to the one passed in.
	changeToTime: function(time) {
		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video")[0]; v.currentTime=' + time
		}, function(results) {});
	},

	// Converts seconds to Hours, Minutes, Seconds (Credit: Stackoverflow)
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
			console.log(data);
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

// Controls all interactions with DOM (hopefully..)
var DomModule = {

	tabURL: '',

	getTabURL: function() {
		// Get the active Chrome tab and its URL.
		var self = this;
		chrome.tabs.query({
			active: true,
			lastFocusedWindow: true
		}, function(tabs) {
			// Since there can only be one active tab in one active window, 
			self.tabURL = tabs[0].url;
			$('#url').text('Current URL: ' + self.tabURL);
		});
	},

	// Checks if the current tab has a HTML5 video on it.
	checkHasVideo: function() {
		var self = this;
		chrome.tabs.executeScript(null, {
			code: 'var v = document.getElementsByTagName("video"); v'
		}, function(results) {
			// There was a video found!
			if (results && results.length > 0) {
				ServerModule.getTagsFromServer(self.tabURL);
				self.saveTagButtonListener();
			} else {
				$('#message').text("No HTML5 video found!");
				$('#save-a-tag').hide();
			}
		});
	},

	// Listens for when the save tag button is clicked.
	saveTagButtonListener: function() {
		var self = this;
		$("#saveTime").click(function() {
			var description = $('#tagDesc').val();
			if (description !== "") {
				$('#tagDesc').val("");
				TagModule.createNewTag(self.tabURL, description);
			} else {
				$('#tagDesc').attr("placeholder", "Please enter a tag..");
			}
		});
	},

	init: function() {
		// First, find out what page we're on..
		this.getTabURL();
		// Then, check if there's a video on the page.
		this.checkHasVideo();
	},
};

// The function that starts everything..
$(function() {
	DomModule.init();
});