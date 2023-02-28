const os = require('node:os');
const crypto = require('crypto');
const package = require('../package.json');

module.exports = function getClientIdPostfix() {
  return `${package.name}@${package.version}@${os.hostname}-${crypto.randomBytes(4).toString('hex')}`;
}
