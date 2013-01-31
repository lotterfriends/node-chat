var socket = io.connect('http://localhost');

socket.on('connect', function(){
	$('#login').modal('show');
});

var fehler_id = 0;
socket.on('error', function(message){
	var $fehlerContainer = $('#login:visible .modal-body');
	if (!$fehlerContainer.length) {
		$fehlerContainer = $('.content.chat');
	}
	var $fehler = $('.alert', $fehlerContainer);
	if ($fehler.length) {
		window.clearTimeout(fehler_id);
		$fehler.html(message).show();
	} else {
		var $message = $('<div class="alert alert-error">' + message + '</div>');
		$fehlerContainer.prepend($message);
	}
	$fehlerContainer.ready(function() {
		fehler_id = window.setTimeout(function() {
			$('.alert', $fehlerContainer).hide('slow');
		},6000);
	});
	if(!$(window).data('user')) {
		$('#login').modal('show');
	}  else {
		$('#data').focus();
	}
});

socket.on('login', function(username) {
	$('#login').modal('hide');
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

	$('#login .btn.btn-primary').click(function() {
		var username = $.trim($('#login input[name=nickname]').val());
		socket.emit('adduser', username);
	});

    $('#login').on('shown', function () {
		$('#login input[name=nickname]:first').focus().select();
		$('.modal-backdrop.fade.in').unbind('click')
    });

	$('#login input[name=nickname]:first').on('keypress', function(e) {
		if(e.which == 13) {
			$(this).blur();
			$('#login .btn.btn-primary').click();
			e.stopPropagation();
			return false;
		}
	});
});
