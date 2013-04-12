var _ = require('underscore')

module.exports = function(app, passport){

  // routes
  var controllerPath = __dirname + '/../controllers/'
  var main = require(controllerPath + 'main_controller')
  app.resource(main)

  var user = require(controllerPath + 'users_controller')
  app.resource('users', user)
  // login
  app.post('/users/login',
      passport.authenticate('local',
        {
          failureRedirect: '/users/login',
          failureFlash: true,
          successFlash: 'Successfully logged in'
        }
      ), user.login_callback)

  app.post('/users/logout', user.logout)
  app.get('/users/login', user.login)

}
