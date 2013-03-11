var _ = require('underscore')

module.exports = function(app, passport){

  // TODO: app.use doesnt work! Why?

  app.all('*', function(req, res, next){

    if (!req.user)
      res.locals.user = null

    else
      res.locals.user = req.user

    next()
  })

  // routes
  var controllerPath = __dirname + '/../controllers/'
  var main = require(controllerPath + 'main_controller')
  app.resource(main)

  var user = require(controllerPath + 'users_controller')
  app.resource('users', user)

  app.post('/users/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
      res.redirect('/');
    });

  app.post('/users/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  var message = require(controllerPath + 'messages_controller')
  app.resource('messages', message)

}
