var User = require('../../models/user')
    , ObjectId = require('mongoose').Types.ObjectId

module.exports = {

  load_user:
    function(request, response, next) {
      if (request.session.user_id) {
        User.find({ "_id": new ObjectId(request.session.user_id)}, function(error, users){
          if (!error)
            response.locals.user_ui = users[0]

          next()
        })
      } else {
        next()
      }
    }

}
