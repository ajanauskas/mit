var Room = require(__dirname + '/../models/room')
    , _ = require('underscore')

module.exports.index = function(request, response) {

  if (request.format === 'json') {
    // request from backbone collection

    Room
      .find({})
      .select('title _id')
      .exec(function(error, rooms){
        response.send(JSON.stringify(rooms))
      })

  } else {
    // html request

    response.render('rooms/index', {
      page_title: 'Chat rooms'
    })

  }

}

module.exports.create = function(request, response) {

  if (request.format === 'json') {
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

  } else {
    responde.send('JSON format only supported');
  }

}
