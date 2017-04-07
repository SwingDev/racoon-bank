const Promise = require('bluebird');

const express = require('express')
const router = express.Router()
const winston = require('winston')

const healthchecks = require('../../services/healthchecks')


module.exports = function(models) {
  router.get('/_ah/health', (req, res, next) => {
    healthchecks.checkDNS()
      .then(() => res.json({status: 'ok'}))
      .catch((err) => {
        winston.error(err)
        res.status(503).send(err.message)
      });
  })

  return {
    router: router,
    path: '/'
  }
}
