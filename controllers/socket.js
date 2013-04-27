var mongoose = require('mongoose')
    , _ = require('underscore')
    , Message = mongoose.model('message')
    , ObjectId = mongoose.Types.ObjectId

module.exports = function(io) {

  var messages = io
    .of('/messages')
    .on('connection', function(socket){
      socket
        .on('all', function(data){
          var roomId = data.roomId

          Message
            .find({ "room": new ObjectId(roomId) })
            .select('body created_at sender room')
            .sort({ created_at: -1 })
            .limit(50)
            .exec(function(error, messages){
              socket.emit('messages', messages)
            })

        })
        .on('new', function(data) {
          var roomId = data.roomId
              , userId = socket.handshake.user.id

          var message = new Message({
            body: data.body,
            sender: userId,
            room: roomId,
            created_at: new Date(Date.now())
          })

          message.save(function(error) {
            if (!error) {
              messages.emit('new message', {
                body: message.body,
                created_at: message.created_at
              })
            }
          })

        })

    })

  var rooms = io
    .of('/rooms')
    .on('connection', function(socket) {
      socket
        .on('new room', function(data) {
          rooms.emit('new room');
        })
        .on('destroy room', function(data) {
          rooms.emit('destroyed room');
        })

    })

}
