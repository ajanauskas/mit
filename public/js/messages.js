(function($){
  var messages_socket = io.connect('http://localhost:3000/messages');
  var $chat = $('#chat')

  function appendMessage(message){
    var new_line = '\n';

    if ($chat.text() === '')
      new_line = '';

    $chat.text($chat.text() + new_line + message.sender.login + ': ' + message.body);
    $chat.scrollTop($chat[0].scrollHeight);
  }

  messages_socket.on('messages', function(data){
    if (data.status !== 'OK')
      return

    $chat.text('');
    for (var i = 0; i < data.messages.length; i++) {
      appendMessage(data.messages[i])
    }
  })

  messages_socket.on('new message', function(data){
    if (data.status !== 'OK')
      return

    var new_line = '\n';

    if ($chat.text() === '')
      new_line = '';

    $chat.text($chat.text() + new_line + data.sender + ': ' + data.body);
    $chat.scrollTop($chat[0].scrollHeight);
  })

  $('#chat-form').submit(function(event){
    event.preventDefault();
    var $this = $(this);

    $.ajax({
      url: $this.attr('action'),
      type: 'POST',
      data: $this.serialize(),
      success: function(data){
        if (data.status === 'OK')
          $this.find("input[type='text']").val("")
        else if (data.error_message)
          alert(data.error_message)
      }
    })
  })

})(jQuery)


