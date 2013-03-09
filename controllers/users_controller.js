var User = require(__dirname + '/../models/user')

module.exports.new = function(request, response){

  response.render('users/new', {
    page_title: 'Sign up'
  })

}

module.exports.create = function(request, response){

  var user_form = {
    login: request.body.login,
    password: request.body.password
  }

  new User(user_form).save(function(error){
    if (error)
      render_failure()
    else
      render_success()
  })

  function render_success(){
    response.redirect('/')
  }

  function render_failure(){
    request.error = 1
    exports.new(request, response)
  }

}
