var _ = require('underscore')
var User = require('../models/user')

module.exports = {
  current_user:
    function(request) {
      if (request.session.user_id)
        return request.session.user_id

      return null
    },

  error_helper:
    function(errors) {
      if (_.isEmpty(errors))
        return ""

      var output = ""

      _.map(errors, function(error, field) {
        output += "<div>" + error.message + "</div>"
      })

      output = "<div class='alert alert-error'>"
               + "<button type='button' class='close' data-dismiss='error'>&times;</button>"
               + output
               + "</div>"

      return output
    }
}
