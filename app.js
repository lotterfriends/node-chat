/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , routes = require('./routes')
  , socket = require('socket.io')
  , bbcode = require('bbcode')
  , smileyParser = require('./smileyParser.js');

// Configuration

app.configure(function(){
	app.set('title', 'Chat');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

var usernames = {};
var messages = [];

io.sockets.on('connection', function (socket) {
	
	socket.on('adduser', function(username){
		if (!username || username.trim().length < 1 ) {
			return socket.emit('fehler', 'Kein Benutzername eingegeben');
		}
		if (usernames[username] || username == "SERVER"){
			return socket.emit('fehler', 'Benutzername bereits vergeben');
		}
		if (username.length > 20) {
			return socket.emit('fehler', 'Zu langer Benutzername');
		}
		username = escapeHTML(username).trim();
		socket.username = username;
		usernames[username] = username;
		socket.emit('login', username);
                for (var i in messages) {
			socket.emit('updatechat', messages[i].username, messages[i].message,messages[i].time);
                }
		socket.emit('updatechat', 'SERVER', 'du bist verbunden');
		socket.broadcast.emit('updatechat', 'SERVER', username + ' hat sich verbunden');
		io.sockets.emit('updateusers', usernames);
	});

	socket.on('sendchat', function (data)  {
		if (!socket.username) {
			return socket.emit('fehler', 'Nicht eingeloggt!');
		} 
		if (!data) {
			return socket.emit('fehler', 'Kein Text eingegeben.');
        } 
        if (data.length > 300) {
			return socket.emit('fehler','Zu langer Text');
		}
		data = escapeHTML(data).trim();
		bbcode.parse(data, function(content) {
			content = smileyParser.parse(content);	
			content = convertLinks(content);
			var time = new Date();
				
			messages.push({ "username" : socket.username, "time" : time, "message" : content });
			if (messages.length > 30) {
				messages.shift();
			}
			io.sockets.emit('updatechat', socket.username, content, time);
		});
	});

	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' wurde ausgeloggt');
	});

});

function escapeHTML(input) {
	if (!input || input.trim() == "") return "";
	return input
	.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function convertLinks(text){      
		var sucher = new RegExp("(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");
		var ergebnis = text.match(sucher);
		if (ergebnis && ergebnis.length) {
			for (var i in ergebnis)	{		
				var regexp = new RegExp(ergebnis[i], "g");					
				text = text.replace(regexp, " <a href='"+ergebnis[i].trim()+"' target='_blank'>" + ergebnis[i].trim() + "</a>");
			}
		}		
		return text;		
}




server.listen(1337, function(){
	console.log("Der Chat wurde auf Port 1337 gestartet");
});

