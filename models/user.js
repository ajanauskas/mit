var mongoose = require(__dirname + '/../config/mongo')

var UserSchema = mongoose.Schema({
  login: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: Array,
  created_at: { type: Date, default: (new Date()).getTime() }
})

module.exports = mongoose.model('user', UserSchema)

