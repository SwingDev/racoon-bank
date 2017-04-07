const Promise = require('bluebird');

const express = require('express')
const locks = require('locks')
const router = express.Router()
const winston = require('winston')

const auth = require('../../config/middlewares/auth')
const errors = require('../../config/errors')


module.exports = function(models, config, providers) {

  function checkCardNumberOrThrow(number) {
    if (["5543054846078707", "5306762013019398", "5511230963873959", "5301541377612971", "5364391199741044", "5282312671753090", "5312144838442646", "5125183972645181", "5593284600351151", "5403098418763690", "5188633022915442", "5263130635234582", "5223470599936759", "5333723424028540", "5121622621608847", "5412282499348329", "5337282205092015", "5277493023609987", "5273202354912272", "5194614820202854"].indexOf(number) === -1) {
      throw new errors.BadRequest("Invalid card number.");
    }
  }

  function checkCurrencyOrThrow(currency) {
    if (["USD", "PLN"].indexOf(currency) === -1) {
      throw new errors.BadRequest("Invalid currency.");
    }
  }

  function parseAmount(amount) {
    if (/^\-?\d+$/.test(amount) !== true) {
      throw new errors.BadRequest("Invalid amount value.");
    }

    return parseInt(amount, 10);
  }

  function getCreditCardBalance(user, number, currency) {
    const key = `${user}_cc_${number}_${currency}`;
    return providers.redis.getAsync(key)
      .then(balance => {
        if (balance === null) {
          return providers.redis.setAsync(key, 100000).return("100000");
        }
        return balance;
      })
      .then(parseAmount);
  }

  function getAccountBalance(user, currency) {
    const key = `${user}_acc_${currency}`;
    return providers.redis.getAsync(key)
      .then(balance => {
        if (balance === null) {
          return providers.redis.setAsync(key, 100000000).return("100000000");
        }
        return balance;
      })
      .then(parseAmount);
  }

  function incCreditCardBalance(user, number, currency, amount) {
    const ccKey = `${user}_cc_${number}_${currency}`;
    const accKey = `${user}_acc_${currency}`;

    return Promise.all([
      getCreditCardBalance(user, number, currency),
      getAccountBalance(user, currency)
    ]).spread((ccBalance, accBalance) => {
        if (ccBalance + amount < 0) {
          throw new errors.BadRequest("Insufficient funds on the credit card.");
        }
        if (accBalance - amount < 0) {
          throw new errors.BadRequest("Insufficient funds on your account.");
        }

        return Promise.all([
          providers.redis.setAsync(ccKey, ccBalance + amount),
          providers.redis.setAsync(accKey, accBalance - amount)
        ]);
      });
  }

  let userLocks = {};
  function lockForUser(user) {
    return new Promise((resolve, reject) => {
      if (!userLocks[user.id]) {
        userLocks[user.id] = locks.createMutex();
      }

      userLocks[user.id].lock(() => {
        resolve(userLocks[user.id]);
      });
    });
  }

  router.get('/creditcard/:number/balance/:currency', auth.requiresAuthenticatedUser, (req, res, next) => {
    return lockForUser(req.user)
      .then((lock) => {
        return Promise.all([
          Promise.resolve(req.params.number).tap(checkCardNumberOrThrow),
          Promise.resolve(req.params.currency).tap(checkCurrencyOrThrow),
        ]).spread((number, currency) => {
            return getCreditCardBalance(req.user.id, number, currency);
          })
          .then(balance => res.json({ balance }))
          .catch(next)
          .finally(() => lock.unlock());
      });
  });

  router.post('/creditcard/:number/charge', auth.requiresAuthenticatedUser, (req, res, next) => {
    return lockForUser(req.user)
      .then((lock) => {
        Promise.all([
          Promise.resolve(req.params.number).tap(checkCardNumberOrThrow),
          Promise.resolve(req.body.currency).tap(checkCurrencyOrThrow),
          Promise.resolve(req.body.amount).then(parseAmount)
        ]).spread((number, currency, amount) => {
            return incCreditCardBalance(req.user.id, number, currency, -amount)
          })
          .then(() => res.json({ ok: true }))
          .catch(next)
          .finally(() => lock.unlock());
      });
  });

  router.post('/creditcard/:number/refund', auth.requiresAuthenticatedUser, (req, res, next) => {
    return lockForUser(req.user)
      .then((lock) => {
        Promise.all([
          Promise.resolve(req.params.number).tap(checkCardNumberOrThrow),
          Promise.resolve(req.body.currency).tap(checkCurrencyOrThrow),
          Promise.resolve(req.body.amount).then(parseAmount)
        ]).spread((number, currency, amount) => {
            return incCreditCardBalance(req.user.id, number, currency, amount)
          })
          .then(() => res.json({ ok: true }))
          .catch(next)
          .finally(() => lock.unlock());
      });
  });

  router.get('/balance/:currency', auth.requiresAuthenticatedUser, (req, res, next) => {
    return lockForUser(req.user)
      .then((lock) => {
        Promise.all([
          Promise.resolve(req.params.currency).tap(checkCurrencyOrThrow),
        ]).spread((currency) => {
            return getAccountBalance(req.user.id, currency);
          })
          .then(balance => res.json({ balance }))
          .catch(next)
          .finally(() => lock.unlock());
      });
  });


  return {
    router: router,
    path: '/api'
  }
}
