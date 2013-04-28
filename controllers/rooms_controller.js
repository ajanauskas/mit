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

