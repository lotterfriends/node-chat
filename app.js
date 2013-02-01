/**
 * Module dependencies & Global Variables.
 */
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , routes = require('./routes')
  , socket = require('socket.io')
  , bbcode = require('bbcode')
  , smileyParser = require('./lib/smileyParser.js')
  , stringUtil = require('./lib/stringUtil.js')
  , intNat = require('./lib/intNat.js')
  , usernames = {}
  , messages = [];


// Configuration
app.configure(function(){
	app.set('title', 'Chat');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });
	app.set('env', 'development'); // production - development
	app.set('server_username', 'SERVER');
	app.set('saved_messages_count', 30);
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	intNat.load('de');
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.set('port', 1338);
	
});

app.configure('production', function(){
	app.use(express.errorHandler());
	app.set('port', 1337);
	io.set('log level', 1);
});

// Routes
app.get('/', routes.index);

// Server Events
io.sockets.on('connection', function (socket) {
	socket.on('login', login);
	socket.on('sendchat', sendchat);
	socket.on('disconnect', disconnect);
});

// Start Server
server.listen(app.get('port'), function(){
	console.log("Enviroment: ", app.get('env'));
	console.log("Port: ", app.get('port'));
});

function login(username) {
	var socket = this;
	validateUsername(username, function(error) {
		if (error) return socket.emit('error', error);
		username = stringUtil.escapeHTML(username).trim();
		socket.username = username;
		usernames[username] = username;
		socket.emit('login', username);
		loadMessages(socket);
		socket.emit('updatechat', app.get('server_username'), intNat.T("user.youConnected"));
		socket.broadcast.emit('updatechat', app.get('server_username'), intNat.T("user.hasConnected", username));
		io.sockets.emit('updateusers', usernames);
	});
}

function sendchat(message) {
	var socket = this;
	validateMessage(socket.username, message, function(error) {
		if (error) return socket.emit('error', error);
		message = stringUtil.escapeHTML(message).trim();
		bbcode.parse(message, function(content) {
			content = smileyParser.parse(content);
			content = stringUtil.convertLinks(content);
			var time = new Date();
			messages.push({ "username" : socket.username, "time" : time, "message" : content });
			if (messages.length > app.get('saved_messages_count')) messages.shift();
			io.sockets.emit('updatechat', socket.username, content, time);
		});
	});
}

function disconnect() {
	var socket = this;
	if (socket.username) {
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', app.get('server_username'), intNat.T("user.logedout",socket.username));	
	}
}

function loadMessages(socket) {
	for (var i in messages) {
		socket.emit('updatechat', messages[i].username, messages[i].message, messages[i].time);
	}
}

function validateUsername(username, callback) {
	var MAX_LENGTH = 20;
	var MIN_LENGTH = 4;
	if (!username || username.trim().length < 1) {
		 callback(intNat.T("error.NoUsername"));
		 return;
	}
	if (usernames[username] || username == app.get('server_username')) {
		callback(intNat.T("error.UsernameChoosen"));
		return;
	}
	if (username.length > MAX_LENGTH) {
		callback(intNat.T("error.toLongUsername"));
		return;
	}
	if (username.length < MIN_LENGTH) {
		callback(intNat.T("error.toShortUsername"));
		return;
	}
	callback();
}

function validateMessage(username, message, callback) {
	var MAX_LENGTH = 300;
	var MIN_LENGTH = 1;
	if (!username) {
		callback(intNat.T("error.notLoggedIn"));
		return;
	}
	if (!message || message.trim().length < MIN_LENGTH) {
		callback(intNat.T("error.noMessage"));
		return;
	}
	if (message.length > MAX_LENGTH) {
		callback(intNat.T("error.longMessage"));
		return;
	}
	callback();
}
