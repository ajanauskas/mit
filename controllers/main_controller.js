var User = require(__dirname + '/../models/user')

module.exports.home = function(request, response){

  render()

  function render() {
    response.render('main/home', {
      page_title: 'MIT website'
    })
  }

}
