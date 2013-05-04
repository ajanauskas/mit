var mongoose = require('mongoose')
    , _ = require('underscore')
    , Message = mongoose.model('message')
    , Room = mongoose.model('room')
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
            .populate('sender', 'login')
            .sort({ created_at: 1 })
            .limit(100)
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
                created_at: message.created_at,
                roomId: roomId,
                sender: {
                  login: socket.handshake.user.login
                }
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

          var roomBody = {
            title: data.title
          }

          var room = new Room(roomBody);
          room.save(function(error) {
            if (!error) {
              rooms.emit('new room', {
                title: room.title,
                _id: room._id
              })
            }
          })

        })
        .on('destroyed room', function(data) {

          if (!socket.handshake.user.hasRole('room_deletion')) {
            return;
          }

          var id = data._id;

          Room.remove({ _id: id }, function(error) {
            if (!error) {
              rooms.emit('destroyed room', { _id: id });
            }
          })
        })

    })

}
