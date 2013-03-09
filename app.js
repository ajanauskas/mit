var fs = require('fs')
var config = JSON.parse(fs.readFileSync('./config/config.json'))

var express = require('express')
var app = express()

app.set('env', process.env.NODE_ENV || 'development')
app.use(express.logger('dev'))

app.configure(function(){
  app.set('views', __dirname + '/views')
  app.set('views')
  app.set('view engine', 'jade')

  app.use(express.cookieParser());
  app.use(express.session({ secret: "y4YMuhZnC9ntW050cjPT" }));

  app.use(express.methodOverride())
  app.use(express.bodyParser())

  require('./config/routes')(app)
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function(){
  // error handling
  // app.use(function(err, req, res, next){
  //   res.send(500, 'Something bad happened!')
  // });

})

var port = config.port || '3000'
var host = config.host || 'localhost'

console.log("Listening " + host + " on port " + port)
app.listen(port, host)
