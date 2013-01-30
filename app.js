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
  , smileyParser = require('./lib/smileyParser.js')
  , stringUtil = require('./lib/stringUtil.js')
  , intNat = require('./lib/intNat.js');


// Configuration

app.configure(function(){
	app.set('title', 'Chat');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });
	app.set('env', 'development'); // production - development
	app.set('server_username', 'SERVER');
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
});

// Routes
app.get('/', routes.index);

var usernames = {};
var messages = [];

io.sockets.on('connection', function (socket) {
	socket.on('adduser', function(username){
		if (!username || username.trim().length < 1 ) {
			return socket.emit('error', intNat.T("error.NoUsername"));
		}
		if (usernames[username] || username == app.get('server_username')){
			return socket.emit('error', intNat.T("error.UsernameChoosen"));
		}
		if (username.length > 20) {
			return socket.emit('error', intNat.T("error.LongUsername"));
		}
		username = stringUtil.escapeHTML(username).trim();
		socket.username = username;
		usernames[username] = username;
		socket.emit('login', username);
		for (var i in messages) {
			socket.emit('updatechat', messages[i].username, messages[i].message,messages[i].time);
		}
		socket.emit('updatechat', app.get('server_username'), intNat.T("youConnected"));
		socket.broadcast.emit('updatechat', app.get('server_username'), username + ' ' + intNat.T("xConnected"));
		io.sockets.emit('updateusers', usernames);
	});

	socket.on('sendchat', function (data)  {
		if (!socket.username) {
			return socket.emit('error', intNat.T("error.notLoggedIn"));
		}
		if (!data) {
			return socket.emit('error', intNat.T("error.noMessage"));
        }
        if (data.length > 300) {
			return socket.emit('error',intNat.T("error.longMessage"));
		}
		data = stringUtil.escapeHTML(data).trim();
		bbcode.parse(data, function(content) {
			content = smileyParser.parse(content);
			content = stringUtil.convertLinks(content);
			var time = new Date();
			messages.push({ "username" : socket.username, "time" : time, "message" : content });
			if (messages.length > 30) messages.shift();
			io.sockets.emit('updatechat', socket.username, content, time);
		});
	});

	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updatechat', app.get('server_username'), socket.username + ' ' + intNat.T("xLogout"));
	});

});

server.listen(app.get('port'), function(){
	console.log("Enviroment: ", app.get('env'));
	console.log("Port: ", app.get('port'));
});

