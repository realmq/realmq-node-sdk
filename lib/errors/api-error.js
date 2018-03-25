'use strict';

/**
 * Constructs a generalized api error object.
 *
 * @param message
 * @param code
 * @param details
 * @param status
 * @param name
 * @return {{name: string, status: number, code: *|number, details, toString(): string}}
 */
module.exports = ({
  message,
  code,
  details = {},
  status = 500,
  name = 'ApiError',
}) => ({
  name,
  message,
  status,
  details,
  code: code || status,

  toString() {
    return `${this.name} [${this.status}] - ${this.message}`;
  },
});
