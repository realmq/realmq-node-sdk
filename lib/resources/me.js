'use strict';

module.exports = apiClient => ({
  user: {
    retrieve: () => apiClient.get('/me/user'),
  },

  token: {
    retrieve: () => apiClient.get('/me/auth/token'),
  },
});
