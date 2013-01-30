
var fs = require('fs');
var resources = "./resources/";
keys = {}

exports.load = function(language) {
	readJSON(resources + language + ".json", function(err, json) {
		if (err) console.log(err);
		keys = json;
	});
};


exports.T = function(intNatKey) {
	return keys[intNatKey];
};


function readJSON(path, cb) {
	fs.readFile(path, 'utf8', function (err, data) {
		if (err) return cb(err);
		try {
			var json = JSON.parse(data);
		} catch (err) {
			return cb(err);
		}
		cb(null, json);
	});
}
