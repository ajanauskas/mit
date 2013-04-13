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
