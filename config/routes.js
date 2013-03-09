module.exports = function(app){

  var controllerPath = __dirname + '/../controllers/'
  var main = require(controllerPath + 'main_controller')
  app.get('/', main.home)

  var user = require(controllerPath + 'users_controller')
  app.get('/users/new', user.new)
  app.post('/users/new', user.create)

}
