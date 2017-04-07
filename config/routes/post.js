'use strict'

const errors = require('../errors')

module.exports = (app, config, unhandledErrorControllers) => {
  app.use((err, req, res, next) => {
    if (err && err.name && errors.mapping[err.name]) {
      res.status(errors.mapping[err.name]).json({error:err.message})
      return
    }

    if (err && err.name && err.name === 'RequestCodeError') {
      res.status(err.errorCode).json({error: err.message})
      return
    }

    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next()
    }

    if (err.stack && err.stack.includes('ValidationError')) {
      res.status(422).json(err)
      return
    }

    next(err)
  })

  unhandledErrorControllers.forEach(c => app.use(c))

  app.use((req, res) => {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    }
    return res.status(404).json(payload)
  })
}
