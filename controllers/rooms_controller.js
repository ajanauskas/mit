var mongoose = require('mongoose')
    , Room = mongoose.model('room')
    , _ = require('underscore')
    , helpers = require('./../helpers/application')

module.exports.index = function(request, response) {

  response.format({
    json: function() {
      // request from backbone collection

      Room
        .find({})
        .select('title _id')
        .limit(20)
        .sort({ title: 1})
        .exec(function(error, rooms){
          response.send(JSON.stringify(rooms))
        })

    },
    html: function() {
      // html request

      Room
        .find({})
        .select('title _id')
        .limit(20)
        .sort({ title: 1})
        .exec(function(error, rooms){
          _.each(rooms, function(room) {
            room.title = helpers.htmlEscape(room.title);
          })

          response.render('rooms/index', {
            page_title: 'Chat rooms',
            rooms: rooms
          })
        })
    }

  })

}

