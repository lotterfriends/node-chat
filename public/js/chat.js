var socket = io.connect('http://localhost');

socket.on('connect', function(){
	socket.emit('adduser', prompt("Wie ist dein Nickname?"));
});

socket.on('error', function(message){
	alert(message);
	if(!$(window).data('user')) {
		socket.emit('adduser', prompt("Wie ist dein Nickname?"));
	}
	$('#data').focus();
});

socket.on('login', function(username) {
	$(window).data('user', username);
});


socket.on('updatechat', function (username, data, time) {
	if (!time) time = new Date();
	var zeit = Date.create(time).format('{HH}:{mm}:{ss}');
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
	$('#users ul').append('<li class="nav-header">Online</li>');
	$.each(data, function(key, value) {
		var activeCSSClass = '';
		var user = '<a href="#">' + key + '</a>';
		if ($(window).data('user') == key){
			activeCSSClass = ' class="active" ';
			user = key;
		} 
		$('#users ul').append('<li' + activeCSSClass +'>'+ user +'</li>');
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
		var akt_count = $(this).val().length;
		$('.count').html(300 - akt_count);
	});

	$('.clear').click(function() {
		$('#messages-inner *').remove();
	});
	
	$('#users #user-list').on('click', 'a', function(e) {
		$('#data').val('@' + $(this).text() + ' ' + $('#data').val()).focus();
		e.stopPropagation();
		return false;
	});
	
	

});
