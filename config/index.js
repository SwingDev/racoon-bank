'use strict';

/**
 * Module dependencies.
 */

const path = require('path');
const extend = require('util')._extend;

const env = process.env.NODE_ENV || 'local';

const defaults = {
  env: env,
  root: path.join(__dirname, '..'),
  dev: {
    randomDelay: process.env.DEV_ENABLE_RANDOM_DELAY,
    randomErrors: process.env.DEV_ENABLE_RANDOM_ERRORS,
    varyAll: process.env.DEV_VARY_ALL,
    debugEndpoints: process.env.DEV_ENABLE_DEBUG_ENDPOINTS
  },
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASS,
    enable_offline_queue: true,
    connect_timeout: 50000
  },
  bugsnagApikey: process.env.BUGSNAG_APIKEY,
};

/**
 * Expose
 */

const envSpecificConfig = {}
const config = extend(envSpecificConfig, defaults)

module.exports = config
