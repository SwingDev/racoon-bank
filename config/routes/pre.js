'use strict'

module.exports = (app, config) => {
  if (config.dev.randomDelay) {
    app.use((req, res, next) => {
      setTimeout(next, Math.random() * 1000 * config.dev.randomDelay)
    })
  }

  if (config.dev.randomErrors) {
    app.use((req, res, next) => {
      if (Math.random() <= config.dev.randomErrors) {
        res.status(502).send()
      } else {
        next()
      }
    })
  }

  if (config.dev.varyAll) {
    app.use((req, res, next) => {
      require("vary")(res, '*')
      next()
    })
  }
}
