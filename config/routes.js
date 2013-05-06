var _ = require('underscore')
    , controllerPath = __dirname + '/../controllers/'

module.exports = function(app, passport, auth){

  var main = require(controllerPath + 'main_controller')
  app.get('/', main.index)

  var user = require(controllerPath + 'users_controller')
  app.get('/users', auth.requiresLogin, user.index)
  app.get('/users/new', user.new)
  app.post('/users', user.create)
  app.post('/users/logout', user.logout)
  app.get('/users/login', user.login)
  app.post('/users/:id', user.update)
  app.delete('/users/:id', user.destroy)
  app.get('/users/search', user.search)
  app.get('/users/search/:search', user.search)
  app.post(
    '/users/login',
    passport.authenticate('local',
      {
        failureRedirect: '/users/login',
        failureFlash: true,
        successFlash: 'Successfully logged in'
      }), user.login_callback)
  var room = require(controllerPath + 'rooms_controller')
  app.get('/rooms', auth.requiresLogin, room.index)
  app.get('/rooms.json', auth.requiresLogin, room.index)

  var message = require(controllerPath + 'messages_controller')
  app.get('/messages.json', auth.requiresLogin, message.index)

}
