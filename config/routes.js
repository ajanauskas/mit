var _ = require('underscore')
    , controllerPath = __dirname + '/../controllers/'

module.exports = function(app, passport, auth){

  // routes
  var main = require(controllerPath + 'main_controller')
  app.get('/', main.index)

  var user = require(controllerPath + 'users_controller')
  app.get('/users/index', user.index)
  app.get('/users/new', user.new)
  app.post('/users/create', user.create)
  // login
  app.post(
    '/users/login',
    passport.authenticate('local',
      {
        failureRedirect: '/users/login',
        failureFlash: true,
        successFlash: 'Successfully logged in'
      }), user.login_callback)

  app.post('/users/logout', user.logout)
  app.get('/users/login', user.login)

  var room = require(controllerPath + 'rooms_controller')
  app.get('/rooms', auth.requiresLogin, room.index)
  app.get('/rooms.json', auth.requiresLogin, room.index)
  app.post('/rooms', auth.requiresLogin, room.index)
  app.post('/rooms.json', auth.requiresLogin, room.index)

}
