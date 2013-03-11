var _ = require('underscore')
    , application_middleware = require('./middleware/application')

module.exports = function(app){

  // load user if id is present in session
//  app.use(application_middleware.load_user)

  // routes
  var controllerPath = __dirname + '/../controllers/'
  var main = require(controllerPath + 'main_controller')
  app.resource(main)

  var user = require(controllerPath + 'users_controller')
  app.resource('users', user)
  app.post('/users/login', user.login)
  app.post('/users/logout', user.logout)

  var message = require(controllerPath + 'messages_controller')
  app.resource('messages', message)

}
