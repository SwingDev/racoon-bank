const dns = require('dns')
const Promise = require('bluebird')

Promise.promisifyAll(dns);


module.exports = {
  checkDNS: () => dns.lookupAsync('www.google.com')
}