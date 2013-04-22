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

}
