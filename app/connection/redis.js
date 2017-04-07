const Promise = require('bluebird')
const redis = Promise.promisifyAll(require('redis'));


module.exports = (config) => {
  return redis.createClient(config);
};
