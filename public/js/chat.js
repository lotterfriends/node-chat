// Global Vars
var socket = io.connect('http://localhost')
	, state
	, visibilityChange
	, fehler_id = 0
	, pageReadyFunctions = []
	, KEYCODE_ENTER = 13;

// Client Events
socket.on('connect', showDialog);
socket.on('error', handleError);
socket.on('login', login);
socket.on('updatechat', updateChat);
socket.on('updateusers', updateUser);

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
		$('.count').html(300 - akt_count);
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
	
	$('.expand').tooltip();
	
	$(window).on('click','.expand:not(.expanded)', function() {
		var $holder = $('#messages .input-append');
		$('input', $holder).hide('slow');
		if ($('textarea', $holder).length) {
			$('textarea', $holder).show();
		} else {
			$holder.prepend('<textarea class="span7" id="message_area">');
			$('textarea', $holder).on('keyup', function() {
				var akt_count = $(this).val().length;
				$('.count').html(300 - akt_count);
			});
			$('textarea', $holder).on('keydown', function(e) {
				if (e.which == KEYCODE_ENTER && e.ctrlKey) {
					$(this).blur();
					$('#datasend').click();
				}
			});
		}
		$('.icon-arrow-down', $holder).removeClass('icon-arrow-down').addClass('icon-arrow-up');
		$('.count').data('old-margin-top', $('.count').css('margin-top')).css('margin-top', '46px');
		$('.count').data('old-margin-left', $('.count').css('margin-left')).css('margin-left', '687px');
		
		$(this).attr('data-original-title', 'Normale Eingabe');
		$(this).addClass('expanded');
		$(this).val('');
		$('.count').html(300);
	});
	
	$(window).on('click','.expand.expanded', function() {
		var $holder = $('#messages .input-append');
		$('textarea', $holder).hide();
		$('#data', $holder).val('').show();
		$('.count').html(300);
		$('.icon-arrow-up', $holder).removeClass('icon-arrow-up').addClass('icon-arrow-down');
		$('.count').css('margin-top', $('.count').data('old-margin-top'));
		$('.count').css('margin-left', $('.count').data('old-margin-left'));
		$(this).attr('data-original-title', 'Erweiterte Eingabe');
		$(this).removeClass('expanded');
	});
	

});
