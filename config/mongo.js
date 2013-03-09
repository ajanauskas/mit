var fs = require('fs')
var config = JSON.parse(fs.readFileSync('./config/database.json'))

var host = config.host || 'localhost'
var database = config.database || 'mit'

var mongoose = require('mongoose')
mongoose.connect(host, database)

mongoose.set('debug', true)

module.exports = mongoose

