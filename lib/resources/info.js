'use strict';

module.exports = apiClient => ({
  version: () => apiClient.get('/version'),

  time: () => apiClient.get('/time'),
});
