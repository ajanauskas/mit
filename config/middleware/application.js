var User = ('../../models/user')

module.exports = {
  load_user:
    function(request, response, next) {
      if (request.session.user_id) {
        User.find({ "_id": request.session.user_id}, function(error, user){
          response.locals.user = user
          next()
        })
      }
      next()
    }

}


