'use strict'

const express = require('express');
const auth = require('../middlewares/auth');

const createControllerRouter = (controllers) => {
  const router = express.Router()

  controllers.forEach((controller) => {
    router.use(controller.path, controller.router)
  })

  return router
}

module.exports = (app, config, providers, controllers, models, unhandledErrorControllers) => {
  require('./pre')(app, config)

  const router = createControllerRouter(controllers)
  app.use('/', auth.authenticateUser(providers, models), router)

  require('./post')(app, config, unhandledErrorControllers)
}
