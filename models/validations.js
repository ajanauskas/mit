var _ = require('underscore')

module.exports.validateNotEmpty = function(schema, field) {
  schema.path(field).validate(function(value) {
    if (_.isEmpty(value))
      return false
    else
      return true
  }, 'not empty')
}

module.exports.validateRanges = function(schema, field, ranges) {
  if (!ranges instanceof Object)
    throw new Error('validatesRanges accepts only Object as an argument')

  function errorMessage() {
    var message = "Field " + field + " must have"

    if (ranges.min) {
      message += " minimum length: " + ranges.min
      if (ranges.max) {
        message += " and"
      }
    }

    if (ranges.max)
      message += " maximum length: " + ranges.max

    return message
  }

  schema.path(field).validate(function(value){
    if (_.isEmpty(value))
      return false

    if (ranges.min && value.length < ranges.min)
      return false

    if (ranges.max && value.length > ranges.max)
      return false

    return true
  }, 'valid ranges')
}
