'use strict';

const DEFAULT_METHODS = ['create', 'update', 'remove', 'retrieve', 'list'];

const getMethodHandler = ({apiClient, path}, method) => {
  switch (method) {
    case 'create':
      return (params, options) => apiClient.post(path, params, options);
    case 'remove':
      return (id, options) => apiClient.del(`${path}/${id}`, options);
    case 'update':
      return (id, patch, options) =>
        apiClient.patch(`${path}/${id}`, patch, options);
    case 'retrieve':
      return (id, params, options) =>
        apiClient.get(`${path}/${id}`, params, options);
    case 'list':
      return (params, options) => apiClient.get(path, params, options);
    default:
      throw new Error(`Cannot create handler for method '${method}.`);
  }
};

module.exports = ({
  apiClient,
  path,
  methods = DEFAULT_METHODS,
  ...properties
}) => {
  return methods.reduce(
    (resource, method) => ({
      ...resource,
      [method]: getMethodHandler(resource, method),
    }),
    {
      path,
      apiClient,
      ...properties,
    }
  );
};
