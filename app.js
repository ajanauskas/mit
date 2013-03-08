var fs = require('fs')
var config = JSON.parse(fs.readFileSync('config.json'))

var express = require('express')
var app = express()

app.use(app.router)
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response){
  response.send('hello world!')
})

var port = config.port || '3000'
var host = config.host || 'localhost'

console.log("Listening " + host + " on port " + port)
app.listen(port, host)
