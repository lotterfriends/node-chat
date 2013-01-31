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
* @param parameter
*		Kommaseparierte Parameter die {0} usw. ersetzen (optional).
*
*/
exports.T = function(intNatKey, parameter) {
	var value = keys[intNatKey];
	if (!value) { value = intNatKey; }
  	if (parameter) {
    		var parameterArray = parameter;
    		if (parameter.constructor == String) {
      			parameterArray = parameter.split(',');
    		}
    		for (var i in parameterArray ) {
      			var search = '{'+i+'}';
      			var replace = parameterArray[i];
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
