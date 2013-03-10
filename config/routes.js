var _ = require('underscore')

module.exports = function(app){

  // load user if id is present in session
  app.use(require('./middleware/application').load_user)

  // routes
  var controllerPath = __dirname + '/../controllers/'
  var main = require(controllerPath + 'main_controller')
  app.resource(main)

  var user = require(controllerPath + 'users_controller')
  app.resource('users', user)
  app.post('/users/login', user.login)
  app.post('/users/logout', user.logout)

}
