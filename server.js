// Raymond Ho
// 8/22/15

var bodyParser = require('body-parser'),
	express = require('express'),
	Datastore = require('nedb');

var db = new Datastore({
	filename: __dirname + '/db.json',
	autoload: true
});


var app = express();

app.use(bodyParser.urlencoded({
	extended: false
}));


// This is to get all tags for a certain video
app.get('/bestpart/gettags', function(req, res) {
	var urlObject = {url: req.query.url};
	console.log("Received a GET tags request from:", urlObject.url);
	db.findOne(urlObject, function(err, docs) {
		if (docs === null) {
			var errorString = urlObject.url + " was not found in the database..";
			res.send({error: errorString});
		}
		else {
			console.log('Sending over the docs..', docs);
			res.send(docs);
		}
	});
});

// This is to add or update a new tag
app.post('/bestpart/tag', function(req, res) {
	var tagJSON = req.body;
	var tag = {
		tag_created: new Date(),
		tag_time: tagJSON.time,
		tag_description: tagJSON.description,
		tag_score: 0
	};
	var searchFor = {
		url: tagJSON.url
	};
	console.log("Received a POST", tagJSON);
	db.findOne(searchFor, function(err, docs) {
		if (docs === null) {
			video = {
				url: tagJSON.url,
				tags: [tag],
			};
			db.insert(video);
			console.log("Added to db.");
		} else {
			console.log(docs);
			db.update(searchFor, {
				$push: {
					tags: tag
				}
			}, {}, function() {});
			console.log("Updated DB");
		}
	});
});

// This is to update the votes a tag has.
app.post('/bestpart/votes', function(req, res) {
	var tagJSON = req.body;
	var searchFor = {
		url: tagJSON.url
	};
	var newScore = tagJSON.vote;
	db.update(searchFor, {
		$inc: {
			score: newScore
		}
	}, {}, function() {});
});

var server = app.listen(3000, function() {
	console.log("http://localhost:3000/");
});