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
  }

  connect() {
    return promised(cb => {
      if (this.mqttClient) {
        return cb(new Error('Broker client already connected.'));
      }

      this.mqttClient = mqtt.connect(this._connectionOptions);
      this.mqttClient.once('connect', () => cb());

      this._registerMqttClientListeners();
    });
  }

  _registerMqttClientListeners() {
    this.mqttClient.on('connect', connack => this.emit('connect', connack));
    this.mqttClient.on('reconnect', () => this.emit('reconnect'));
    this.mqttClient.on('close', () => this.emit('disconnect'));
    this.mqttClient.on('offline', () => this.emit('offline'));
    this.mqttClient.on('error', err => this.emit('error', err));
    this.mqttClient.on('message', (channelId, message) =>
      this._onMessage(channelId, message)
    );
  }

  /**
   * Try to parse json from message buffer and emit `message` event with one event argument of type object containing
   * the following properties:
   * - **channel**: String
   * - **data**:      Buffer, the raw message buffer
   * - **toString**:  Function, return the utf8 string represented by the buffer
   * - **jsonDecode**:Function, json decode the raw message
   *
   * @param channel
   * @param buffer
   * @private
   */
  _onMessage(channel, buffer) {
    const eventArgs = {
      channel,
      data: buffer,
      toString: () => buffer.toString(),
      jsonDecode: () => JSON.parse(buffer.toString()),
    };

    this.emit('message', eventArgs);
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
      if (typeof message !== 'string' && Buffer.isBuffer(message) === false) {
        message = JSON.stringify(message);
      }

      this.mqttClient.publish(channel, message, options, cb);
    });
  }

  subscribe({channel, options}) {
    return promised(cb => this.mqttClient.subscribe(channel, options, cb));
  }

  unsubscribe({channel}) {
    return promised(cb => this.mqttClient.unsubscribe(channel, cb));
  }
}

module.exports = RtmClient;
