// Global Vars

var socket = io.connect('http:' + window.location.hostname)
	, state
	, visibilityChange
	, fehler_id = 0
	, pageReadyFunctions = []
	, KEYCODE_ENTER = 13
	, message_max_chars = parseInt($('.count').text());

// Client Events
socket.on('connect', showDialog);
socket.on('error', handleError);
socket.on('login', login);
socket.on('updatechat', updateChat);
socket.on('updateusers', updateUser);
socket.on('loadSmileys', loadSmileys);

function handleError(message) {
	var DISPLAY_TIME = 6000;
	// 6 Sec.
	var $errorContainer = $('#login .modal-body:visible');
	if (!$errorContainer.length) {
		$errorContainer = $('.content.chat');
	}
	var $error = $('.alert', $errorContainer);
	if ($error.length) {
		window.clearTimeout(fehler_id);
		$error.html(message).show();
	} else {
		var $message = $('<div class="alert alert-error">' + message + '</div>');
		$errorContainer.prepend($message);
	}
	$errorContainer.ready(function() {
		$('input:first', $errorContainer).focus();
		fehler_id = window.setTimeout(function() {
			$('.alert', $errorContainer).hide('slow');
		}, DISPLAY_TIME);
	});
	if (!$(window).data('user')) {
		showDialog();
	}
}

function showDialog() {
	$('#login').modal('show');
	socket.emit("loadSmileys");
}

function hideDialog() {
	$('#login').modal('hide');
}

function focusSendField() {
	$('#data').focus();
}

function login(username) {
	hideDialog();
	$(window).data('user', username);
}

function updateChat(username, message, time) {
	if (!time) time = new Date();
	var zeit = Date.create(time).format('{HH}:{mm}:{ss}');
	var $time = '<span class="time">(' + zeit + ') </span>';
	var $user = '<span class="username">' + username + ': </span>';
	var $message = '<span class="message">' + message + '</span>';
	var $entry = '<div class="entry">' + $time + $user + $message + '</div>';
	$('#messages-inner').append($entry);
	$('#messages-inner').scrollTo($('#messages-inner .entry:last'));
	focusSendField();
	if (document[state] == "hidden") {		
		$.titleAlert("Neue Nachricht!");
	}
}

function updateUser(users) {
	$('#users ul').empty();
	$('#users ul').append('<li class="nav-header">Online</li>');
	$.each(users, function(key, value) {
		var activeCSSClass = '';
		var user = '<a href="#">' + key + '</a>';
		if ($(window).data('user') == key) {
			activeCSSClass = ' class="active" ';
			user = key;
		}
		$('#users ul').append('<li' + activeCSSClass + '>' + user + '</li>');
	});
}

function loadSmileys(smileyDir,smileys) {
	var j = 0, buffer = "";
	buffer = "<table cellpadding='2'>";
	for (var i in smileys) {
		var code = (smileys[i].code+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
		if (j == 0) buffer += "<tr>";
		buffer += '<td><a href="javascript:insert(\''+code+'\')">';
		buffer += '<img src="' + smileyDir + smileys[i].url + '" alt="' + code + '" />';
		buffer += "</a></td>";
		if (j == 5) {
			j = 0;
			buffer += "</tr>";
		} else {
			j++;
		}
	}
	if (j < 5) buffer += "</tr>";
	buffer += "</table>";
	if (!$('.smileyHider table').length) {
		$('.smileyHider').append(buffer);	
	}
}
 
function insert(code) {
	$('#data').val($('#data').val() + " " + code + " ");
	$('.smiley-holder').popover('hide');
	focusSendField();
}

function initPuller() {
	$('.puller').on('mousedown', function(e) {
		var $puller = $(this);
		var $messages = $puller.prevAll('#messages-inner');
		$messages.data('resize', true);
		e.stopPropagation();
		return false;
	});

	$(window).on('mouseup', function(e) {
		var $puller = $('.puller');
		var $messages = $puller.prevAll('#messages-inner');
		$messages.data('resize', false);
	});

	$(window).on('mousemove', function(e) {
		var $messages = $('#messages-inner');
		if ($messages.data('resize')) {
			var height = e.pageY - $messages.offset().top;
			$messages.height(height);
		}
	});
}

pageReadyFunctions.push(initPuller);

function initVisibilityStateListener() {
	if ( typeof document.hidden !== "undefined") {
		visibilityChange = "visibilitychange";
		state = "visibilityState";
	} else if ( typeof document.mozHidden !== "undefined") {
		visibilityChange = "mozvisibilitychange";
		state = "mozVisibilityState";
	} else if ( typeof document.msHidden !== "undefined") {
		visibilityChange = "msvisibilitychange";
		state = "msVisibilityState";
	} else if ( typeof document.webkitHidden !== "undefined") {
		visibilityChange = "webkitvisibilitychange";
		state = "webkitVisibilityState";
	}

	$(document).on(visibilityChange, function() {
		if (document[state] == 'visible') {
			document.title = $(document).data('title');
		}
	});
}

pageReadyFunctions.push(initVisibilityStateListener);

function initCountChars() {
	$('#data').on('keyup', function() {
		var akt_count = $(this).val().length;
		$('.count').html(message_max_chars - akt_count);
	});
}

pageReadyFunctions.push(initCountChars);

$(function() {

	for (var i in pageReadyFunctions) {
		pageReadyFunctions[i]();
	}

	$(document).data('title', document.title);

	$('#datasend').click(function() {
		var message = $('#data').val();
		if ($('#messages .input-append textarea:visible').length) {
			message = $('#messages .input-append textarea').val();
		}
		$('#data').val('');
		$('#messages .input-append textarea').val('');
		socket.emit('sendchat', message);
	});

	$('#data').keypress(function(e) {
		if (e.which == KEYCODE_ENTER) {
			$(this).blur();
			$('#datasend').click();
		}
	});

	$('#users #user-list').on('click', 'a', function(e) {
		$('#data').val('@' + $(this).text() + ' ' + $('#data').val()).focus();
		e.stopPropagation();
		return false;
	});

	$('#login .btn.btn-primary').click(function() {
		var username = $.trim($('#login input[name=nickname]').val());
		socket.emit('login', username);
	});

	$('#login').on('shown', function() {
		$('#login input[name=nickname]:first').focus().select();
		$('.modal-backdrop.fade.in').unbind('click')
	});

	$('#login input[name=nickname]:first').on('keypress', function(e) {
		if (e.which == KEYCODE_ENTER) {
			$(this).blur();
			$('#login .btn.btn-primary').click();
			e.stopPropagation();
			return false;
		}
	});
	
	
	$('.smiley-holder').popover({
		content : function() {
			return $('.smileyHider').html();
		}
	});

});
