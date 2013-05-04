var fs = require('fs')
    , configJSON = JSON.parse(fs.readFileSync('./config/config.json'))
    , env = process.env.NODE_ENV || 'development'
    , config = configJSON[env] || {}

var express = require('express')
    , app = express()
    , port = config.port || '3000'
    , host = config.host || '0.0.0.0'
    , http = require('http')
    , server = http.createServer(app)
    , MongoStore = require('connect-mongo')(express)
    , flash = require('connect-flash')
    , mongoose = require(__dirname + '/config/mongo')(config)

app.set('env', env)

// bootstrap models so we dont need to require them every time in every controller
// and also automatically register all models to mongo
var models_path = __dirname + '/models'
    , defined_models = [
      'user.js',
      'room.js',
      'message.js'
    ]

for (var i = 0; i < defined_models.length; i++) {
  require(models_path + '/' + defined_models[i])
}

// setup passport - user authentication
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , passportIo = require('passport.socketio')
    , auth = require('./config/middleware/authorization')

passport.serializeUser(auth.userSerialization)
passport.deserializeUser(auth.userDeserialization)
passport.use(new LocalStrategy(auth.localStrategy))

var middlewares = require('./config/middleware/application')

var sessionStore = new MongoStore({
  db: 'mit'
})

app.configure(function(){
  app.use(express.static(__dirname + '/public'))

  app.set('views', __dirname + '/views')
  app.set('views')
  app.set('view engine', 'jade')

  app.use(express.cookieParser());
  app.use(express.session({
    key: "chatifier-session",
    secret: "y4YMuhZnC9ntW050cjPT",
    cookies: { maxAge: 60000 },
    store: sessionStore
  }))

  app.use(express.methodOverride())
  app.use(express.bodyParser())

  app.use(passport.initialize())
  app.use(passport.session())

  // configure application middlewares before routes
  app.use(middlewares.load_user)

  // routes
  app.use(flash())
  app.use(app.router)
  require('./config/routes')(app, passport, auth)
})

app.configure('development', function(){
  app.use(express.logger())
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

server.listen(port, host, function() {
  console.log("Listening " + host + " on port " + port)

  var io = require('socket.io').listen(server)
      , socketController = require('./controllers/socket')(io)

  io.set("authorization", passportIo.authorize({
    key:    'chatifier-session',
    secret: "y4YMuhZnC9ntW050cjPT",
    store:   sessionStore
  }));

})

// Helpers for express to use. Useful when rendering views
app.locals(require('./helpers/application'))
app.locals._ = require('underscore')
