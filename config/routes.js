module.exports = function(app){

  var controllerPath = __dirname + '/../controllers/'
  var main = require(controllerPath + 'main')
  app.get('/', main.home)

}
