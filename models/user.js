var mongoose = require(__dirname + '/../config/mongo'),
    validations = require('./validations')

var UserSchema = mongoose.Schema({
  login: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: Array,
  created_at: { type: Date, default: (new Date()).getTime() }
})

var User = mongoose.model('user', UserSchema)

validations.validateNotEmpty(User.schema, 'login')
validations.validateRanges(User.schema, 'login', { min: 5, max: 15 })

module.exports = User

