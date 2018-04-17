const syncChannelName = '$RMQ/sync/my/subscriptions';

module.exports = ({rtm}) =>
  rtm.subscribe({channel: syncChannelName}).then(() => {
    return rtm.on(`${syncChannelName}/message`, message => {
      if (!message || !message.data || !message.data.event) return;

      switch (message.data.event) {
        case 'subscription-created':
          rtm.subscribe({channel: message.data.data.channelId});
          rtm.emit('subscriptionCreated', message.data.data);
          break;
        case 'subscription-deleted':
          rtm.unsubscribe({channel: message.data.data.channelId});
          rtm.emit('subscriptionDeleted', message.data.data);
          break;
        case 'subscription-updated':
          rtm.emit('subscriptionUpdated', message.data.data);
          break;
        default:
          break;
      }
    });
  });
