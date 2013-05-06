var mongoose = require('mongoose')
    , User = mongoose.model('user')
    ,  _ = require('underscore')

function digestPassword(password){
  var crypto = require('crypto');
  return crypto.createHash('md5').update(password).digest("hex")
}

module.exports.index = function(request, response) {

  if (!request.user.hasRole('user-management')) {
    response.send('Authorization error')
  }

  User
    .find({})
    .select('login roles')
    .sort({ login: 1 })
    .limit(20)
    .exec(function(error, users) {
      response.render('users/index', {
        page_title: 'Users',
        users: users,
        noSidebar: true
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
  var userBody = request.body.user

  var userForm = {
    login: userBody.login,
    password: digestPassword(userBody.password)
  }

  if (_.isEmpty(userBody.password)) {
    errors.push("Password can't be empty")
  } else if (userBody.password.length < 5 && userBody.password.length > 15) {
    errors.push("Password must be between 5 and 15 symbol long")
  }

  if (userBody.password !== userBody.repeat_password) {
    errors.push('Password and confirm password do not match')
  }

  var user = new User(userForm)
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

module.exports.update = function(request, response) {

  if (request.user.hasRole('user-management')) {

    var roles = []
        , submitedRoles = request.body.user.roles;

    _.each(submitedRoles, function(checked, role) {
      if (checked === 'on' && role !== 'god') {
        roles.push(role)
      }
    })

    User.findOne({ "_id": request.params.id }, function(error, user) {
      if (error) {
        response.send(JSON.stringify({ status: 'FAIL' }))
      } else {
        user.roles = roles;
        user.save(function(error) {
          if (error) {
            response.send(JSON.stringify({ status: 'FAIL' }))
          } else {
            var userForm = {
              _id: user._id,
              login: user.login,
              roles: user.roles
            }

            response.send(JSON.stringify({ status: 'OK', user: userForm }))
          }
        })
      }
    })

  } else {
    response.send(JSON.stringify({ status: 'Authorization error'}));
  }

}


module.exports.destroy = function(request, response) {

  if (request.user.hasRole('user-management')) {

    User.remove({ "_id": request.params.id }, function(error) {
      if (error) {
        response.send(JSON.stringify({ status: 'FAIL' }))
      } else {
        response.send(JSON.stringify({ status: 'OK' }))
      }
    })

  } else {
    response.send(JSON.stringify({ status: 'Authorization error'}));
  }

}

module.exports.search = function(request, response) {

  if (request.user.hasRole('user-management')) {

    var searchQuery = {}

    if (request.params.search) {
      searchQuery = { login: new RegExp(request.params.search, "i") }
    }

    User
      .find(searchQuery)
      .select('login roles')
      .sort({ login: 1 })
      .limit(20)
      .exec(function(error, users) {
        if (error) {
          response.send(JSON.stringify({ status: 'FAIL' }))
        } else {
          response.send(JSON.stringify(users))
        }
      })

  } else {
    response.send(JSON.stringify({ status: 'Authorization error'}));
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

