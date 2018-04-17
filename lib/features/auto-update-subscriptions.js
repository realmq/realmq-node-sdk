module.exports = ({rtm, filterFn = () => Promise.resolve(true)}) =>
  Promise.all([
    rtm.on('subscription-created', subscription => {
      if (subscription.allowRead !== true) return;

      filterFn(subscription).then(ok => {
        if (ok) {
          rtm.subscribe({channel: subscription.channelId});
        }
      });
    }),
    rtm.on('subscription-deleted', subscription =>
      rtm.unsubscribe({channel: subscription.channelId})
    ),
    rtm.on('subscription-updated', subscription => {
      if (subscription.allowRead === false) {
        return rtm.unsubscribe({channel: subscription.channelId});
      }
      filterFn(subscription).then(ok => {
        if (ok) {
          rtm.subscribe({channel: subscription.channelId});
        }
      });
    }),
  ]);
