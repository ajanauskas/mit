var _ = require('underscore')

module.exports.load_user = function(req, res, next) {
  if (!req.user)
    res.locals.user = null
  else
    res.locals.user = req.user

  next()
}

