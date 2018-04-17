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
      filterFn(subscription).then(ok => {
        if (ok) {
          rtm.unsubscribe({channel: subscription.channelId});
        }
      })
    ),
    rtm.on('subscription-updated', subscription =>
      filterFn(subscription).then(ok => {
        if (ok) {
          const method =
            subscription.allowRead === true ? 'subscribe' : 'unsubscribe';

          rtm[method]({channel: subscription.channelId});
        }
      })
    ),
  ]);
