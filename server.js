// Raymond Ho
// 9/22/15

var bodyParser = require('body-parser');
var express = require('express');
var Datastore = require('nedb');
var db = new Datastore({
	filename: __dirname + '/db.json',
	autoload: true
});


var app = express();
app.use(bodyParser.urlencoded({
	extended: false
}));

app.post('/bestpart', function(req, res) {
	var tagJSON = req.body;
	var tag = {
		tag_created: new Date(),
		tag_time: tagJSON.time,
		tag_description: tagJSON.description,
		tag_upvotes: 0,
		tag_downvotes: 0
	};
	var searchFor = {
		url: tagJSON.url
	};
	console.log("Received a POST");
	db.findOne(searchFor, function(err, docs) {
		if (docs == null) {
			video = {
				url : tagJSON.url,
				tags : [tag],
			};
			db.insert(video);
			console.log("Added to db.");
		} else {
			console.log(docs);
			db.update(searchFor, {
				$push: {
					tags: tag
				}
			}, {}, function(){});
			console.log("Updated DB");
		}
	});
});

var server = app.listen(3000, function() {
	console.log("http://localhost:3000/");
});