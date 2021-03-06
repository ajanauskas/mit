var validations = require('./validations')
    , mongoose = require('mongoose')
    , _ = require('underscore')

var UserSchema = mongoose.Schema({
  login: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: Array,
  messages: [{ type: mongoose.Schema.ObjectId, ref: 'message' }],
  rooms: [{ type: mongoose.Schema.ObjectId, ref: 'room' }],
  created_at: { type: Date, default: (new Date()).getTime() }
})

UserSchema.methods.hasRole = function(role) {
  if (_.contains(this.roles, 'god')) {
    return true;
  }

  return _.contains(this.roles, role)
}

var User = mongoose.model('user', UserSchema)

validations.validateNotEmpty(User.schema, 'login')
validations.validateRanges(User.schema, 'login', { min: 5, max: 15 })

