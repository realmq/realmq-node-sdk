'use strict';

const request = require('request');
const createApiError = require('./errors/api-error');
const addShadowProperty = require('./responses/shadow-property');

class ApiClient {
  constructor(authToken, {baseUrl = ApiClient.DEFAULT_BASE_URL} = {}) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  get(resource, params = {}, options = {}) {
    options.method = 'GET';
    options.qs = params;

    return this._makeRequest({
      resource,
      options: {...options, method: 'GET', qs: params},
    });
  }

  del(resource, options = {}) {
    return this._makeRequest({
      resource,
      options: {...options, method: 'DELETE'},
    });
  }

  post(resource, payload = null, options = {}) {
    return this._makeRequest({
      resource,
      options: {...options, body: payload, method: 'POST'},
    });
  }

  put(resource, payload = null, options = {}) {
    return this._makeRequest({
      resource,
      options: {...options, body: payload, method: 'PUT'},
    });
  }

  patch(resource, payload = null, options = {}) {
    return this._makeRequest({
      resource,
      options: {...options, body: payload, method: 'PATCH'},
    });
  }

  /**
   * Generic request method.
   *
   * @param resource
   * @param options
   * @returns {Promise}
   * @private
   */
  _makeRequest({resource, options = {}}) {
    return new Promise((resolve, reject) => {
      request(
        this._getRequestArgs({resource, options}),
        this._getRequestHandler({resolve, reject})
      );
    });
  }

  /**
   * Assemble arguments to be passed to **request**.
   *
   * @param resource
   * @param options
   * @returns {Object}
   * @private
   */
  _getRequestArgs({resource, options = {}}) {
    return {
      ...options,
      baseUrl: this.baseUrl,
      uri: resource,
      json: true,
      auth: {
        bearer: this.authToken,
      },
    };
  }

  /**
   *
   * @param resolve
   * @param reject
   * @return {*}
   * @private
   */
  _getRequestHandler({resolve, reject}) {
    return (err, res, body) => {
      if (err) {
        return reject(
          createApiError({message: err.message, httpResponse: res})
        );
      }

      if (res.statusCode >= 400) {
        return reject(
          createApiError({
            ...(body || {
              message: 'Request failed.',
              code: 'ERROR',
            }),
            status: res.statusCode,
            httpResponse: res,
          })
        );
      }

      return resolve(
        addShadowProperty({
          target: body || {},
          property: 'httpResponse',
          value: res,
        })
      );
    };
  }
}

ApiClient.DEFAULT_BASE_URL = 'https://api.realmq.com';

module.exports = ApiClient;
