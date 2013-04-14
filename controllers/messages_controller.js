var Message = require(__dirname + '/../models/message')
    , _ = require('underscore')
    , ObjectId = require('mongoose').Types.ObjectId

module.exports.index = function(request, response) {

  response.format({
    json: function() {
      if (_.isEmpty(request.params.room_id)) {
        response.send(JSON.stringify({
          'status': 'FAIL',
          'message': 'No room provided'
        }))
      } else {

        Message
          .find({ "_id": new ObjectId(request.params.room_id) })
          .select('body created_at')
          .exec(function(error, messages){
            response.send(JSON.stringify(messages))
          })

      }
    }
  })

}
