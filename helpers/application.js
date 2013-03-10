var _ = require('underscore')

module.exports = {
  error_helper:
    function(errors) {
      if (_.isEmpty(errors))
        return ""

      var output = ""

      _.map(errors, function(error, field) {
        output += "<div><strong>" + field + ": </strong>" + error + "</div>"
      })

      output = "<div class='alert alert-error'>"
               + "<button type='button' class='close' data-dismiss='error'>&times;</button>"
               + output
               + "</div>"

      return output
    }
}
