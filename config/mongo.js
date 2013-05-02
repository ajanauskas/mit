module.exports = function(config) {

  config = config.database || {};

  var host = config.host || 'localhost'
  var database = config.database || 'mit'

  var mongoose = require('mongoose')
  mongoose.connect(host, database)

  mongoose.set('debug', true)

  return mongoose;

}

