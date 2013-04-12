var mongoose = require(__dirname + '/../config/mongo'),
    validations = require('./validations')

var RoomSchema = mongoose.Schema({
  title: { type: String, unique: true, required: true},
  messages: [{ type: mongoose.Schema.ObjectId, ref: 'message' }],
  created_at: { type: Date, default: (new Date()).getTime()}
})

var Room = mongoose.model('room', RoomSchema)

validations.validateNotEmpty(UserSchema, 'title')

module.exports = Room
