

exports.escapeHTML = function(input) {
	if (!input || input.trim() == "") return "";
	return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

exports.convertLinks = function(text){      
	var searcher = new RegExp("(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");
	var result = text.match(searcher);
	if (result && result.length) {
		for (var i in result){
			var regexp = new RegExp(result[i], "g");
			text = text.replace(regexp, " <a href='"+result[i].trim()+"' target='_blank'>" + result[i].trim() + "</a>");
		}
	}
	return text;
}

exports.escapeRegExp = function(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
