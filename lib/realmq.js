'use strict';

const ApiClient = require('./api-client');
const RtmClient = require('./rtm-client');
const autoSubscribeFn = require('./features/auto-subscribe');
const tokens = require('./resources/tokens');
const channels = require('./resources/channels');
const info = require('./resources/info');
const me = require('./resources/me');
const messages = require('./resources/messages');
const users = require('./resources/users');
const subscriptions = require('./resources/subscriptions');
const generateClientIdPostfix = require('./get-client-id-postfix');

class RealMQ {
  static get API_RESOURCES() {
    return [
      ['tokens', tokens],
      ['channels', channels],
      ['info', info],
      ['messages', messages],
      ['me', me],
      ['subscriptions', subscriptions],
      ['users', users],
    ];
  }

  /**
   * @param {string} authToken
   * @param {string} [host]
   * @param {boolean} [autoConnect]
   * @param {boolean} [autoSubscribe]
   * @param {boolean} [enableSubscriptionSyncEvents]
   * @param {() => string} [getClientIdPostfix]
   */
  constructor(
    authToken,
    {
      host = RealMQ.DEFAULT_HOST,
      autoConnect = false,
      autoSubscribe = false,
      enableSubscriptionSyncEvents = true,
      getClientIdPostfix = generateClientIdPostfix
    } = {}
  ) {
    this.apiClient = new ApiClient(authToken, {baseUrl: `https://api.${host}`});

    RealMQ.API_RESOURCES.forEach(([name, createResource]) => {
      this[name] = createResource(this.apiClient);
    });

    const clientIdPostfix = getClientIdPostfix();

    this.rtm = new RtmClient(authToken, {
      host: `rtm.${host}`,
      enableSubscriptionSyncEvents,
      clientId: `${authToken}${clientIdPostfix ? `:${clientIdPostfix}`: ''}`
    });

    if (autoConnect || autoSubscribe) {
      this.rtm.connect().then(() => {
        if (autoSubscribe) return this.autoSubscribe();
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
}

RealMQ.DEFAULT_HOST = 'realmq.com';

module.exports = RealMQ;
