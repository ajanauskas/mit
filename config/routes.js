module.exports = function(app){

  app.get('/', function(request, response){
    response.send('hello world!')
  })

  app.get('/users/:id', function(request, response){
    var db_callback = function(db, error) {
      if (error) {
        console.log('Something went terribly wrong with MongoDB!')
        return
      }

      console.log('We are ready to go!')
      var user = require(__dirname + '/../collections/users')

      user.init(db)
      user.get(request.params.id, function(users){
        response.send(users)
      })
    }

    console.log(__dirname)
    require(__dirname + '/mongo')(db_callback)
  })

}
