var Message = require('../models/message')
    , _ = require('underscore')

module.exports.index = function(request, response) {
  response.render('messages/index')
}

module.exports.create = function(request, response) {

  if (!response.locals.user_ui) {
    response.send(JSON.stringify({ status: 'ERROR', error_message: 'Authorization not granted' }))
    return
  }

  var message_form = {
    body: request.body.body,
    sender: response.locals.user_ui._id
  }

  var message = new Message(message_form).save(function(error){
    if (error) {
      response.send(JSON.stringify({ status: 'ERROR', error_message: 'Something terrible happened' }))
    } else {
      response.locals.io.of('/messages').emit('new message', { status: 'OK', sender: response.locals.user_ui.login, body: message_form.body })
      response.send({ status: 'OK' })
    }
  })

}

// socket.io
module.exports.socket = function(io) {
  var messages_socket = io.of('/messages').on('connection', function(socket){
    Message.find({}).populate('sender').exec(function(error, messages) {
      messages_socket.emit('messages', { status: 'OK', messages: messages })
    })
  })
}
