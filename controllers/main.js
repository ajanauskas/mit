var User = require(__dirname + '/../models/user')

module.exports.home = function(request, response){

  User.find({}, function(err, users) {
    render(users)
  })

  function render(users) {
    response.render('main/home', {
      page_title: 'MIT website',
      users: users
    })
  }

}
