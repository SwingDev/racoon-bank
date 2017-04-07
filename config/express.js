'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const vary = require('vary');

const winston = require('winston');
const config = require('./');

/**
 * Expose
 */

module.exports = function (app, config) {
  app.set('x-powered-by', false);
  app.set('etag', false);

  app.use(bodyParser.json())

  app.use((req, res, next) => {
    vary(res, vary.append(res.get('vary') || "", 'Origin'))
    next()
  });

  app.use(cors({
    origin: process.env.CORS_ORIGIN_WHITELIST ? process.env.CORS_ORIGIN_WHITELIST.split(',') : "*",
    optionsSuccessStatus: 200
  }));
};
