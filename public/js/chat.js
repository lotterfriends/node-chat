var socket = io.connect('http://localhost');

socket.on('connect', function(){
	socket.emit('adduser', prompt("Wie ist dein Nickname?"));
});

function login() {
	socket.emit('login', $('#login form').serializeArray());
}


socket.on('fehler', function(message){
	alert(message);
});


socket.on('updatechat', function (username, data) {
	var zeit = Date.create(new Date()).format('{HH}:{mm}:{ss}');
	var $time = '<span class="time">(' + zeit + ') </span>';
	var $user = '<span class="username">'+ username + ': </span>';
	var $message = '<span class="message">' + data +'</span>';
	var $entry = '<p class="entry">' + $time + $user + $message + '</p>';
	$('#messages-inner').append($entry);
	$('#messages-inner').scrollTo($('#messages-inner .entry:last'))
	$('#data').focus();
});

socket.on('updateusers', function(data) {
	$('#users ul').empty();
	$.each(data, function(key, value) {
		$('#users ul').append('<li><a href="#">' + key + '</a></li>');
	});
});

$(function(){
	$('#datasend').click( function() {
		var message = $('#data').val();
		$('#data').val('');
		socket.emit('sendchat', message);
	});

	$('#data').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#datasend').click();
		}
	});

	$('.clear').click(function() {
		$('#messages-inner *').remove();
	});

});
