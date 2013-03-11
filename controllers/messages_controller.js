var Message = require('../models/message')
module.exports.index = function(request, response) {
   response.render('messages/index')
}

// serve messages on page load
module.exports.fetch = function(socket) {
  Message.find({}, function(messages) {
    socket.emit('fetched messages', messages)
  })
}
