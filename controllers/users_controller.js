var User = require(__dirname + '/../models/user')
var _ = require('underscore')

function digestPassword(password){
  var crypto = require('crypto');
  return crypto.createHash('md5').update(password).digest("hex")
}

module.exports.new = function(request, response){

  var errors = request.flash('errors')

  response.render('users/new', {
    page_title: 'Sign up',
    errors: errors[0]
  })

}

module.exports.create = function(request, response){

  var errors = {}
  var user_body = request.body.user

  if (_.isEmpty(user_body.password))
    errors['Password'] = { message: "Password can't be empty" }
  else if (user_body.password.length < 5 && user_body.password.length > 15)
    errors['Password'] = { message: "Password must be between 5 and 15 symbol long" }

  if (user_body.password !== user_body.repeat_password)
    errors['Password'] = { message: 'Password and confirm password do not match' }

//  if (errors)
 //   render_failure(errors)

  var user_form = {
    login: user_body.login,
    password: digestPassword(user_body.password)
  }

  var user = new User(user_form)
  user.save(function(error){
    if (error) {
      render_failure(_.extend(errors, error.errors))
    } else {
      render_success()
    }
  })

  function render_success(){
    response.redirect('/')
  }

  function render_failure(errors){
    request.flash('errors', errors)
    exports.new(request, response)
  }

}
