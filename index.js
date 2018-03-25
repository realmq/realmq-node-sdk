'use strict';

const ApiClient = require('./lib/api-client');
const RealMQ = require('./lib/realmq');

module.exports = RealMQ;
module.exports.RealMQ = RealMQ;
module.exports.ApiClient = ApiClient;
