var message = require('../controllers/messages_controller')

module.exports = function(io) {
  message.socket(io)
}
