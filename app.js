var fs = require('fs')
var config = JSON.parse(fs.readFileSync('./config/config.json'))

var express = require('express')
var app = express()

app.use(app.router)
app.use(express.static(__dirname + '/public'))

require('./config/routes')(app)

var db_callback = function(db, error) {
  if (error) {
    console.log('Something went terribly wrong with MongoDB!')
    return
  }

  console.log('We are ready to go!')
}

require('./config/mongo')(db_callback)

var port = config.port || '3000'
var host = config.host || 'localhost'

console.log("Listening " + host + " on port " + port)
app.listen(port, host)
