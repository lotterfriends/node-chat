
smileyDir = "img/smiley/";
smileys =  [
                { "code" : ":-)", "url" : "smiley.png"},
                { "code" : ":-O", "url" : "smiley-surprise.png"},
                { "code" : "8-)", "url" : "smiley-cool.png"},
                { "code" : ":'(", "url" : "smiley-cry.png"},
                { "code" : "3:-)", "url" : "smiley-evil.png"},
                { "code" : ":-D", "url" : "smiley-grin.png"},
                { "code" : ":-(", "url" : "smiley-sad.png"},
                { "code" : ":-#", "url" : "smiley-mad.png"},
                { "code" : ":-P", "url" : "smiley-razz.png"},
                { "code" : "I-o" , "url" : "smiley-sleep.png"},
                { "code" : ";-)" , "url" : "smiley-wink.png"},
                { "code" : ":beer:" , "url" : "beer.png"},
                { "code" : ":bean:" , "url" : "bean.png"},
                { "code" : ":beans:" , "url" : "beans.png"},
                { "code" : ":coffee:" , "url" : "cup.png"},
	        { "code" : ":toast:" , "url" : "bread.png"},
        	{ "code" : ":toasts:" , "url" : "breads.png"}
];
                
exports.parse = function(text) {
        for(var i in smileys) {
                var code = smileys[i].code;
                var url = smileys[i].url;
                var text = text.replace(code, this.smiley(code, url));
        }
        return text;
}

exports.smiley = function(code, url) {
        return "<img src='" + smileyDir + url + "' alt='" + code + "' />"
}
