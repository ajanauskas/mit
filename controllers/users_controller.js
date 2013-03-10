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

  if (_.isEmpty(request.body.password))
    errors['Password'] = "Password can't be empty"
  else if (request.body.password.length < 5 && request.body.password.length > 15)
    errors['Password'] = "Password must be between 5 and 15 symbol long"

  if (request.body.password !== request.body.repeat_password)
    errors['Password'] = 'Password and confirm password do not match'

  if (errors)
    render_failure(errors)

  var user_form = {
    login: request.body.login,
    password: digestPassword(request.body.password)
  }

  new User(user_form).save(function(error){
    if (error) {
      render_failure()
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
