'use strict';

const EventEmitter = require('events');
const mqtt = require('mqtt');
const promised = require('./responses/promised');

class RtmClient extends EventEmitter {
  constructor(
    authToken,
    {
      clientId,
      clean = false,
      protocol = 'mqtt',
      host = 'rtm.realmq.com',
      enableSubscriptionSyncEvents = true,
      ...opts
    } = {}
  ) {
    super();

    this._connectionOptions = {
      ...opts,
      clean,
      protocol,
      host,
      clientId: clientId || authToken,
    };

    this.enableSubscriptionSyncEvents = enableSubscriptionSyncEvents;
    this.subscribedChannels = [];
  }

  isSubscribedTo(channel) {
    return this.subscribedChannels.includes(channel);
  }

  connect() {
    return promised(cb => {
      if (this.isConnected) {
        return cb(new Error('Broker client already connected.'));
      }

      this.mqttClient = mqtt.connect(this._connectionOptions);
      this.mqttClient.once('connect', () => cb());

      this._registerMqttClientListeners();

      if (this.enableSubscriptionSyncEvents) {
        this.initSubscriptionSyncEvents();
      }
    });
  }

  _registerMqttClientListeners() {
    this.mqttClient.on('connect', connack => this.emit('connected', connack));
    this.mqttClient.on('reconnect', () => this.emit('reconnected'));
    this.mqttClient.on('close', () => this.emit('disconnected'));
    this.mqttClient.on('offline', () => this.emit('offline'));
    this.mqttClient.on('error', err => this.emit('error', err));
    this.mqttClient.on('message', (channel, buffer) => {
      const message = getSdkMessage({channel, buffer});

      this.emit(`${channel}/message`, message);
      this.emit('message', message);
    });
  }

  off(event, handler) {
    return this.removeListener(event, handler);
  }

  get isConnected() {
    return (this.mqttClient && this.mqttClient.connected) === true;
  }

  disconnect() {
    return promised(cb => {
      if (!this.mqttClient || !this.mqttClient.connected) {
        return cb(new Error('Broker client not connected.'));
      }

      this.mqttClient.end(err => {
        delete this.mqttClient;
        cb(err);
      });
    });
  }

  publish({channel, message, options}) {
    return promised(cb => {
      if (Buffer.isBuffer(message) === false) {
        message = JSON.stringify(message);
      }

      this.mqttClient.publish(channel, message, options, cb);
    }).then(() => {
      const sdkMessage = getSdkMessage({channel, buffer: Buffer.from(message)});
      this.emit(`${channel}/message-sent`, sdkMessage);
      this.emit('message-sent', sdkMessage);
    });
  }

  subscribe({channel, options}) {
    if (this.isSubscribedTo(channel)) {
      return Promise.resolve();
    }

    return Promise.all([
      promised(cb => this.mqttClient.subscribe(channel, options, cb)),
      this.subscribedChannels.push(channel),
    ]);
  }

  unsubscribe({channel}) {
    if (!this.isSubscribedTo(channel)) {
      return Promise.resolve();
    }

    return Promise.all([
      promised(cb => this.mqttClient.unsubscribe(channel, cb)),
      this.subscribedChannels.splice(
        this.subscribedChannels.indexOf(channel),
        1
      ),
    ]);
  }

  initSubscriptionSyncEvents() {
    const syncChannelName = '$RMQ/sync/my/subscriptions';
    return promised(cb =>
      this.mqttClient.subscribe(syncChannelName, {}, cb)
    ).then(() => {
      this.on(`${syncChannelName}/message`, message => {
        if (!message || !message.data || !message.data.event) return;
        this.emit(message.data.event, message.data.data);
      });
    });
  }
}

module.exports = RtmClient;

/**
 * Generalize real-time messages.
 *
 * @param channel
 * @param buffer
 * @return {{channel: *, data: *, raw: Buffer}}
 */
function getSdkMessage({channel, buffer}) {
  let data;
  let decoded = false;
  let error = null;

  function decode() {
    try {
      data = JSON.parse(buffer.toString());
    } catch (err) {
      error = err;
    }
  }

  return {
    channel,
    get data() {
      if (decoded === false) {
        decode();
        decoded = true;
      }

      return data;
    },
    get error() {
      if (decoded === false) {
        decode();
        decoded = true;
      }

      return error;
    },
    raw: buffer,
  };
}
