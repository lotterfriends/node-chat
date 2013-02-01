var fs = require('fs');
var resources = "./resources/";
keys = {}

exports.load = function(language) {
	readJSON(resources + language + ".json", function(err, json) {
		if (err) console.log(err);
		keys = json;
	});
};


/*
* Internationalisiert den übergebenen String
* @param intNatKey
*		Key aus der Internationalisierungsdatei ./projekt/recourses/lang_code.json.
* @param N-Parameter
*		Parameter die {0} usw. ersetzen (optional).
*
*/
exports.T = function(intNatKey) {
	var value = keys[intNatKey];
	if (!value) { value = intNatKey; }
  	if (arguments.length > 1) {
  		for (var i = 1; i < arguments.length; i++) {
			var search = '{'+i+'}';
      		var replace = arguments[i];
      		value = value.replace(search, replace);
		} 
  	}
  	return value;	
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
