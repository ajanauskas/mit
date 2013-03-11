var fs = require('fs')
var config = JSON.parse(fs.readFileSync('./config/config.json'))

var express = require('express')
    , Resource = require('express-resource')
    , app = express()
    , port = config.port || '3000'
    , host = config.host || 'localhost'
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server)
    , RedisStore = require('connect-redis')(express)

// set io to be global variable per request
app.use(function(request, response, next){
  response.locals.io = io
  next()
})

app.set('env', process.env.NODE_ENV || 'development')
app.use(express.logger('dev'))
app.configure(function(){
  app.set('views', __dirname + '/views')
  app.set('views')
  app.set('view engine', 'jade')

  app.use(express.cookieParser());
  app.use(express.session({ secret: "y4YMuhZnC9ntW050cjPT", store: new RedisStore }));
  app.use(require('connect-flash')())

  app.use(express.methodOverride())
  app.use(express.bodyParser())

  // routes
  require('./config/routes')(app)
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

console.log("Listening " + host + " on port " + port)

server.listen(port, host)

require('./config/socket')(io)

app.locals(require('./helpers/application'))
app.locals._ = require('underscore')


