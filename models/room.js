var mongoose = require('mongoose')
    , validations = require('./validations')

var RoomSchema = mongoose.Schema({
  title: { type: String, unique: true, required: true},
  created_at: { type: Date, default: (new Date()).getTime()}
})

var Room = mongoose.model('room', RoomSchema)

validations.validateNotEmpty(RoomSchema, 'title')

