'use strict';

const ApiClient = require('./api-client');
const RtmClient = require('./rtm-client');
const autoSubscribeFn = require('./features/auto-subscribe');
const autoSyncSubscriptionsFn = require('./features/auto-sync-subscriptions');
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
   * @param {string} authToken
   * @param {string} [host]
   * @param {boolean} [autoConnect]
   * @param {boolean} [autoSubscribe]
   * @param {boolean} [autoSyncSubscriptions]
   */
  constructor(
    authToken,
    {
      host = RealMQ.DEFAULT_HOST,
      autoConnect = false,
      autoSubscribe = false,
      autoSyncSubscriptions = false,
    } = {}
  ) {
    this.apiClient = new ApiClient(authToken, {baseUrl: `https://api.${host}`});

    RealMQ.API_RESOURCES.forEach(([name, createResouce]) => {
      this[name] = createResouce(this.apiClient);
    });

    this.rtm = new RtmClient(authToken, {host: `rtm.${host}`});

    if (autoConnect || autoSubscribe || autoSyncSubscriptions) {
      this.rtm.connect().then(() => {
        return Promise.all([
          autoSubscribe || autoSyncSubscriptions ? this.autoSubscribe() : null,
          autoSyncSubscriptions ? this.autoSyncSubscriptions() : null,
        ]);
      });
    }
  }

  autoSubscribe(filterFn) {
    return autoSubscribeFn({
      filterFn,
      rtm: this.rtm,
      listSubscriptions: this.subscriptions.list,
    });
  }

  autoSyncSubscriptions() {
    return autoSyncSubscriptionsFn({
      rtm: this.rtm,
    });
  }
}

RealMQ.DEFAULT_HOST = 'realmq.com';

module.exports = RealMQ;
