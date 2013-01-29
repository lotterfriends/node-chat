
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , routes = require('./routes')
  , socket = require('socket.io')
  , bbcode = require('bbcode');

// Configuration


app.configure(function(){
	app.set('title', 'Chat');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', {layout: false});
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
app.get('/chat', routes.chat);

var usernames = {};

io.sockets.on('connection', function (socket) {
	
	socket.on('adduser', function(username){
		username = escapeHTML(username);
		if (username.length > 30) {
			socket.emit('fehler', 'Zu langer Benutzername');
		} else {
			socket.username = username;
			usernames[username] = username;
			socket.emit('updatechat', 'SERVER', 'du bist verbunden');
			socket.broadcast.emit('updatechat', 'SERVER', username + ' hat sich verbunden');
			io.sockets.emit('updateusers', usernames);
		}
	});

	socket.on('sendchat', function (data)  {
		if (!socket.username) {
			socket.emit('loginFehler', 'Nicht eingeloggt!');
		} else if (!data) {
			return;
                } else if (data.length > 500) {
			socket.emit('fehler','Zu langer Text');
		} else {
			data = escapeHTML(data);
                        bbcode.parse(data, function(content) { 
				io.sockets.emit('updatechat', socket.username, content);
			});
		}
	});

	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});

function escapeHTML(input) {
    	if (!input) return "keine Angabe";
        input = input.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
        if (input == "") return "keine Anhabe";
	return input
        .replace(/&/g, '&amp;$1')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

server.listen(1337, function(){
	console.log("express-bootstrap app running");
});

