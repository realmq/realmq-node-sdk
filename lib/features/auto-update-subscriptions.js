module.exports = ({rtm}) =>
  Promise.all([
    rtm.on('subscription-created', subscription =>
      rtm.subscribe({channel: subscription.channelId})
    ),
    rtm.on('subscription-deleted', subscription =>
      rtm.unsubscribe({channel: subscription.channelId})
    ),
    rtm.on(
      'subscription-updated',
      subscription =>
        subscription.allowRead === true
          ? rtm.subscribe({channel: subscription.channelId})
          : rtm.unsubscribe({channel: subscription.channelId})
    ),
  ]);
