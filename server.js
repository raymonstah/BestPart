// Raymond Ho
// 9/22/15

var bodyParser = require('body-parser');
var express = require('express');
var Datastore = require('nedb');  
var db = new Datastore({ filename: __dirname + '/db.json', autoload: true });


var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/bestpart', function(req, res){
    console.log('POST /');
    console.log(req.body);
});

var server = app.listen(3000, function () {
	console.log("http://localhost:3000");
});
