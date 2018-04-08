'use strict';

const ApiClient = require('./api-client');
const RtmClient = require('./rtm-client');
const tokens = require('./resources/tokens');
const channels = require('./resources/channels');
const info = require('./resources/info');
const users = require('./resources/users');
const subscriptions = require('./resources/subscriptions');

class RealMQ {
  static get API_RESOURCES() {
    return [
      ['tokens', tokens],
      ['channels', channels],
      ['info', info],
      ['subscriptions', subscriptions],
      ['users', users],
    ];
  }

  /**
   * @param authToken
   * @param host
   */
  constructor(
    authToken,
    {host = RealMQ.DEFAULT_HOST, autoConnect = false} = {}
  ) {
    this.apiClient = new ApiClient(authToken, {baseUrl: `https://api.${host}`});

    RealMQ.API_RESOURCES.forEach(([name, createResouce]) => {
      this[name] = createResouce(this.apiClient);
    });

    this.rtm = new RtmClient(authToken, {host: `rtm.${host}`});

    if (autoConnect) {
      this.rtm.connect();
    }
  }
}

RealMQ.DEFAULT_HOST = 'realmq.com';

module.exports = RealMQ;
