'use strict';

const SUBSCRIPTION_LOAD_LIMIT = 50;

function _fetchAllReadSubscriptions({list, loadMore, batchSize}) {
  const additionalPageCount = Math.ceil((list.total - batchSize) / batchSize);
  const promisedSubscriptions = [_filterReadSubscriptions(list.items)];

  for (let i = 1, l = additionalPageCount; i <= l; ++i) {
    promisedSubscriptions.push(
      loadMore({
        offset: batchSize * i,
        limit: batchSize,
      }).then(additionalList => _filterReadSubscriptions(additionalList.items))
    );
  }

  return Promise.all(promisedSubscriptions);
}

function _filterReadSubscriptions(subscriptions) {
  return subscriptions.filter(_readSubscriptionFilterFn);
}

function _readSubscriptionFilterFn(subscription) {
  return subscription.allowRead;
}

function _listenOnSyncEvents({rtm, filterFn}) {
  return Promise.all([
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
}

/**
 * @param {Subscription} _
 * @return {Promise<boolean>}
 * @private
 */
function autoSubscribeDefaultFilterFn(_) {
  return Promise.resolve(true);
}

module.exports = ({
  rtm,
  listSubscriptions,
  filterFn = autoSubscribeDefaultFilterFn,
}) =>
  listSubscriptions({limit: SUBSCRIPTION_LOAD_LIMIT}).then(list =>
    _fetchAllReadSubscriptions({
      list,
      loadMore: listSubscriptions,
      batchSize: SUBSCRIPTION_LOAD_LIMIT,
    }).then(fetchedSubscriptions => {
      const subscriptions = [].concat(...fetchedSubscriptions);

      return Promise.all(subscriptions.map(filterFn)).then(filterResults => {
        const promisedSubscriptions = [];
        filterResults.forEach((canSubscribe, subscriptionIndex) => {
          if (canSubscribe) {
            promisedSubscriptions.push(
              rtm.subscribe({
                channel: subscriptions[subscriptionIndex].channelId,
              })
            );
          }
        });

        return Promise.all([
          ...promisedSubscriptions,
          ...[_listenOnSyncEvents({rtm, filterFn})],
        ]);
      });
    })
  );
