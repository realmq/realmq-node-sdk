# RealMQ Node.js SDK

[![NPM Package](https://img.shields.io/npm/v/@realmq/node-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@realmq/node-sdk)
[![Build Status](https://img.shields.io/travis/RealMQ/realmq-node-sdk/master.svg?style=flat-square)](https://travis-ci.org/RealMQ/realmq-node-sdk)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![MIT license](https://img.shields.io/github/license/realmq/realmq-node-sdk.svg?style=flat-square)](LICENSE)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Frealmq%2Frealmq-node-sdk.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Frealmq%2Frealmq-node-sdk?ref=badge_shield)


This node SDK provides developer friendly access the RealMQ REST & Real-time APIs.

## About

[RealMQ](https://realmq.com) is a highly scalable, privacy compliant real-time communication backbone.
Our focus is to deliver great service with best possible integrability while you keep full control over your data.

## Getting Started

Get in touch with us to get an RealMQ account set up.
You can do that by sending an email to service@realmq.com.

### Installation

```bash
$ yarn add @realmq/node-sdk
// or
$ npm i -S @realmq/node-sdk
```

### Usage

```js
const realmq = require('@realmq/node-sdk')('<AUTH_TOKEN>');

// create some resource
const subscription = await realmq.subscriptions.create({
  userId: 'user-1',
  channelId: 'channel-1',
  allowRead: true,
});

// or connect to the real-time API
await realmq.rtm.connect();

// and publish some message
realmq.rtm.publish({
  channel: 'channel-1',
  message: {
    text: 'Welcome!'
  }
});

// receive messages
realmq.rtm.on('message', (message) => {
  console.warn(`received new message in channel: ${message.channel}`, message.data)
});
```


## Documentation

Please check out our full documentation on [realmq.com/docs/node-sdk](https://realmq.com/docs/node-sdk).

---

### LICENSE

The files in this archive are released under MIT license.
You can find a copy of this license in [LICENSE](LICENSE).


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Frealmq%2Frealmq-node-sdk.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Frealmq%2Frealmq-node-sdk?ref=badge_large)