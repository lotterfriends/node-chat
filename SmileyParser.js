function SmileyParser() {
        this.smileyDir = "img/smileys/";
        this.smileys =  [
                { "code" : ":-))", "url" : "smiley-surprise.png"},
                { "code" : ":-)", "url" : "smiley.png"},
                { "code" : "8-)", "url" : "smiley-cool.png"},
                { "code" : ":'(", "url" : "smiley-cry.png"},
                { "code" : "3:-)", "url" : "smiley-evil.png"},
                { "code" : ":-D", "url" : "smiley-grin.png"},
                { "code" : ">:-(", "url" : "smiley-mad.png"},
                { "code" : ":-P", "url" : "smiley-razz.png"},
                { "code" : ":-(", "url" : "smiley-sad.png"},
                { "code" : "I-o" , "url" : "smiley-sleep.png"},
                { "code" : ";-)" , "" : "smiley-wink.png"}];
}


SmileyParser.prototype.parse = function(text) {
        var smileys = this.smileys;
        for(var i in smileys) {
                var code = smileys[i].code;
                var url = smileys[i].url;
                var text = text.replace(code, this.smiley(code, url));
        }
        return text;
}

SmileyParser.prototype.smiley = function(code, url) {
        return "<img src='" + this.smileyDir + url + "' alt='" + code + "' />"
}
