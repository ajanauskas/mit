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
    , io = require('socket.io').listen(server)
    , socketController = require('./config/socket')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , passportIo = require('passport.socketio')
    , MongoStore = require('connect-mongo')(express)
    , flash = require('connect-flash')
    , middlewares = require('./config/middleware/application')
    , auth = require('./config/middleware/authorization')


// setup passport - user authentication
passport.serializeUser(auth.userSerialization)
passport.deserializeUser(auth.userDeserialization)
passport.use(new LocalStrategy(auth.localStrategy))

app.set('env', env)

app.configure(function(){
  app.use(express.static(__dirname + '/public'))

  app.set('views', __dirname + '/views')
  app.set('views')
  app.set('view engine', 'jade')

  var sessionStore = new MongoStore({
    db: 'mit'
  })

  app.use(express.cookieParser());
  app.use(express.session({
    key: "chatifier-session",
    secret: "y4YMuhZnC9ntW050cjPT",
    cookies: { maxAge: 60000 },
    store: sessionStore
  }))

  // set socket IO authorization
  // TODO: isolate this code
  io.set("authorization", passportIo.authorize({
    key:    'chatifier-session',
    secret: "y4YMuhZnC9ntW050cjPT",
    store:   sessionStore
  }));

  app.use(express.methodOverride())
  app.use(express.bodyParser())

  app.use(passport.initialize());
  app.use(passport.session());

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

console.log("Listening " + host + " on port " + port)

server.listen(port, host)
// socket.io must be defined after server.listen
socketController(io)

// Helpers for express to use. Useful when rendering views
app.locals(require('./helpers/application'))
app.locals._ = require('underscore')

