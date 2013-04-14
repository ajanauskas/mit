/*
 *  Generic require login routing middleware
 */

var User = require('../../models/user')
    , ObjectId = require('mongoose').Types.ObjectId
    , crypto = require('crypto')

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/users/login')
  }
  next()
}

exports.localStrategy = function(username, password, callback) {
  process.nextTick(function() {
    User.findOne( { "login": username, "password": crypto.createHash('md5').update(password).digest("hex") },
      function(err, user){
        if (err)
          return callback(err)

        if (!user)
          return callback(null, false, { message: "Bad username or password" })

        return callback(null, user)
      }
    )
  })
}

exports.userSerialization = function(user, callback){
  callback(null, user._id)
}

exports.userDeserialization = function(_id, callback) {
  User.findOne({ "_id": new ObjectId(_id) }, function(err, user){
    callback(err, user)
  })
}
