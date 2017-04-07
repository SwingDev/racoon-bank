'use strict'

const Promise = require('bluebird');
const config = require('..');
const errors = require('../errors');

const vary = require('vary');


/*
 *  Authentication
 */
function authenticateUser(providers, models){
  return (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      return next();
    }

    Promise.resolve(token)
      .then((token) => {
        req.user = {
          id: token
        };

        next();
      })
      .catch(next);
  };
}


/*
 *  Authorization
 */

function requiresAuthenticatedUser(req, res, next) {
  if (!req.user) {
    return next(new errors.Unauthorized("Authorization required."));
  }

  return next();
}


module.exports = { authenticateUser, requiresAuthenticatedUser };
