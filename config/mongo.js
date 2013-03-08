var fs = require('fs')
var database_config = JSON.parse(fs.readFileSync('./config/database.json'))
var mongo = require('mongodb')

var db_host = database_config.host || 'localhost'
var db_port = database_config.port || mongo.Connection.DEFAULT_PORT

module.exports = function(callback) {
  var db = new mongo.Db("mit", new mongo.Server(db_host, db_port, {}))

  db.open(function(error) {
    callback(db, error)
  })
}

