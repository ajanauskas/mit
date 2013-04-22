var mongoose = require('mongoose')
    , User = mongoose.model('user')
    ,  _ = require('underscore')

function digestPassword(password){
  var crypto = require('crypto');
  return crypto.createHash('md5').update(password).digest("hex")
}

module.exports.index = function(request, response) {

  User.find({}, function(error, users){
    response.render('users/index', {
      page_title: 'Users',
      users: users
    })
  })

}

module.exports.new = function(request, response){

  var errors = request.flash('error')

  response.render('users/new', {
    page_title: 'Sign up',
    errors: errors
  })

}

module.exports.create = function(request, response){

  var errors = []
  var user_body = request.body.user

  var user_form = {
    login: user_body.login,
    password: digestPassword(user_body.password)
  }

  if (_.isEmpty(user_body.password))
    errors.push("Password can't be empty")
  else if (user_body.password.length < 5 && user_body.password.length > 15)
    errors.push("Password must be between 5 and 15 symbol long")

  if (user_body.password !== user_body.repeat_password)
    errors.push('Password and confirm password do not match')

  var user = new User(user_form)
  user.save(function(error){
    if (error) {
      render_failure(_.extend(errors, error))
    } else {
      render_success()
    }
  })

  function render_success(){
    request.login(user, function(err) {
      response.redirect('/')
    })
  }

  function render_failure(errors){
    request.flash('error', errors)
    exports.new(request, response)
  }

}

module.exports.logout = function(request,response) {
  request.logout();
  response.redirect('/');
}

module.exports.login = function(request, response) {
  var errors = request.flash('error')

  response.render('users/login', {
    page_title: 'Login',
    errors: errors
  })
}

module.exports.login_callback = function(request, response) {
  response.redirect('/');
}

