'use strict';

const createResource = require('./crud-resource');

module.exports = apiClient =>
  createResource({
    apiClient,
    path: '/auth/tokens',
  });
