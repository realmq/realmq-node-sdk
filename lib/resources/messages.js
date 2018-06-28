'use strict';

const getSdkMessage = require('../responses/message');

const getMessagesApiPath = channel => `/channels/${channel}/messages`;

module.exports = apiClient => ({
  list: ({channel, ...params} = {}, options) => {
    if (!channel) {
      throw new Error('Missing channel to list persisted messages of.');
    }

    const path = getMessagesApiPath(channel);

    return apiClient.get(path, params, options).then(messageList => {
      messageList.items = messageList.items.map(message =>
        getSdkMessage({
          channel,
          timestamp: message.createdAt,
          buffer: Buffer.from(message.content, 'base64'),
        })
      );

      return messageList;
    });
  },
});
