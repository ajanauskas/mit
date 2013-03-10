module.exports = function(app){

  var controllerPath = __dirname + '/../controllers/'
  var main = require(controllerPath + 'main_controller')
  app.resource(main)

  var user = require(controllerPath + 'users_controller')
  app.resource('users', user)

}
