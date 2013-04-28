var mongoose = require('mongoose')
    , validations = require('./validations')

var MessageSchema = mongoose.Schema({
  body: { type: String, required: true },
  created_at: { type: Date, default: (new Date()).getTime() },
  sender: { type: mongoose.Schema.ObjectId, ref: 'user' },
  room: { type: mongoose.Schema.ObjectId, ref: 'room' },
})

var Message = mongoose.model('message', MessageSchema)

validations.validateNotEmpty(Message.schema, 'body')
