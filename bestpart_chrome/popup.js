
// This is for YouTube
$('#saveTime').click(function() {
	if ($('#movie_player').length) {
		// Returns the player time in seconds (not so accurate)
		var currentTime = $('#movie_player').getCurrentTime();
		// This is how you set the time
		$('#movie_player').seekTo(currentTime, true);
	}
});