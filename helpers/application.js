var _ = require('underscore')

module.exports = {

  errorHelper: function(errors) {
    if (_.isEmpty(errors))
      return ""

    var output = ""

    _.map(errors, function(error) {
      output += "<div>" + error + "</div>"
    })

    output = "<div class='alert alert-error'>"
             + "<button type='button' class='close' data-dismiss='error'>&times;</button>"
             + output
             + "</div>"

    return output
  },

  htmlEscape: function(text) {
     return text.replace(/&/g, '&amp;').
       replace(/</g, '&lt;').
       replace(/"/g, '&quot;').
       replace(/'/g, '&#039;');
  }
}
