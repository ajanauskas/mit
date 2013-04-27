var mongoose = require('mongoose')
    , Room = mongoose.model('room')
    , _ = require('underscore')

module.exports.index = function(request, response) {

  response.format({
    json: function() {
      // request from backbone collection

      Room
        .find({})
        .select('title _id')
        .exec(function(error, rooms){
          response.send(JSON.stringify(rooms))
        })

    },
    html: function() {
      // html request

      Room
        .find({})
        .select('title _id')
        .exec(function(error, rooms){
          response.render('rooms/index', {
            page_title: 'Chat rooms',
            rooms: rooms
          })
        })
    }

  })

}

module.exports.create = function(request, response) {

  response.format({
    json: function() {
      var roomForm = {
        title: request.body.title
      }

      var room = new Room(roomForm)
      room.save(function(error){
        if (error) {
          response.send('Error creating room')
        } else {
          response.send(JSON.stringify({
            _id: room._id,
            title: room.title
          }))
        }
      })
    },

    html: function() {
      responde.send('JSON format only supported');
    }

  })

}
