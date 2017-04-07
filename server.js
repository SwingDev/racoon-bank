'use strict';

/**
 * Module dependencies
 */
const Promise = require('bluebird')

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const winston = require('winston')
const config = require('./config');

const models = join(__dirname, 'app/models');
const controllers = join(__dirname, 'app/controllers');

const app = Promise.promisifyAll(express());

/**
 * Expose
 */

module.exports = app;

// Default ultimate error handlers.
const unhandledPromiseRejectionControllers = [
  (err, promise) => {
    console.error("Unhandled rejection: " + (err && err.stack || err))
  }
]

const unhandledErrorControllers = [
  (err, req, res, next) => {
    winston.error(err)
    res.status(500).send(err.message)
  }
]

// Loading Providers
const providers = {
  redis: require('./app/connection/redis')(config.redis)
};

// Bootstrap models
let postSetupCalls = [];

const loadedModels = fs.readdirSync(models)
  .filter(file => !(file[0] === '.'))
  .map(file => {
    const clsPath = join(models, file)
    try {
      return require(clsPath)
    } catch (e) {
      console.error(`Couldn't load model ${file} at ${clsPath} due to:`)
      console.error(e)
      return null
    }
  })
  .filter(f => !!(f && f.constructor && f.call && f.apply))
  .map(cls => {
    const objects = cls(config, providers);

    if (objects['postSetup']) {
      postSetupCalls.push(objects['postSetup']);
      delete objects['postSetup'];
    }

    return objects;
  })
  .reduce( (acc, models) => {
    return Object.assign(acc, models)
  }, {});

postSetupCalls.forEach(hook => hook(loadedModels));

// Bootstrap express
require('./config/express')(app, config);

// Load app controllers
const loadedControllers = fs.readdirSync(controllers)
  .filter(file => !(file[0] === '.'))
  .map(file => {
    const clsPath = join(controllers, file)
    try {
      return require(clsPath)
    } catch (e) {
      console.error(`Couldn't load controller ${file} at ${clsPath} due to:`)
      console.error(e)
      return null
    }
  })
  .filter(f => !!(f && f.constructor && f.call && f.apply))
  .map(cls => cls(loadedModels, config, providers))

// Bootstrap app routes
require('./config/routes')(app, config, providers, loadedControllers, loadedModels, unhandledErrorControllers);

// Register unhandled exception / promise rejection handlers
process.on('unhandledRejection', (err, promise) => {
  unhandledPromiseRejectionControllers.forEach(f => f(err, promise))
})

// Launch
function bootstrapProviders() {
  return Promise.resolve();
}

const port = process.env.PORT || 3000;

bootstrapProviders()
  .then(() => app.listenAsync(port))
  .then(() => {
    console.log('Express app started on port ' + port);
  })
  .catch(err => {
    console.error('Unable to launch due to:', err);
    process.exit(1);
  });
