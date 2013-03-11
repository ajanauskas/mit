var fs = require('fs')
var config = JSON.parse(fs.readFileSync('./config/config.json'))

var express = require('express')
    , Resource = require('express-resource')
    , RedisStore = require('connect-redis')(express)
    , app = express()
    , port = config.port || '3000'
    , host = config.host || 'localhost'
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server)
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , User = require('./models/user')
    , ObjectId = require('mongoose').Types.ObjectId
    , crypto = require('crypto')

passport.serializeUser(function(user, callback){
  callback(null, user._id)
})

passport.deserializeUser(function(_id, callback) {
  User.findOne({ "_id": new ObjectId(_id) }, function(err, user){
    callback(err, user)
  })
})

passport.use(new LocalStrategy(
  function(username, password, callback) {
    process.nextTick(function() {
      User.findOne( { "login": username, "password": crypto.createHash('md5').update(password).digest("hex") },
        function(err, user){
          if (err)
            return callback(err)

          if (!user)
            return callback(null, false, { message: "Bad username or password" })

          return callback(null, user)
        }
      )
    })
  })
)

// global locals
app.use(function(request, response, next){
  response.locals.io = io
  next()
})

app.set('env', process.env.NODE_ENV || 'development')
app.use(express.logger('dev'))
app.configure(function(){
  app.use(express.static(__dirname + '/public'))

  app.set('views', __dirname + '/views')
  app.set('views')
  app.set('view engine', 'jade')

  app.use(express.cookieParser());
  app.use(express.session({ secret: "y4YMuhZnC9ntW050cjPT", store: new RedisStore}));
  app.use(require('connect-flash')())

  app.use(express.methodOverride())
  app.use(express.bodyParser())

  app.use(passport.initialize());
  app.use(passport.session());

  // routes
  app.use(app.router)
  require('./config/routes')(app, passport)
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

console.log("Listening " + host + " on port " + port)

server.listen(port, host)

require('./config/socket')(io)

app.locals(require('./helpers/application'))
app.locals._ = require('underscore')

