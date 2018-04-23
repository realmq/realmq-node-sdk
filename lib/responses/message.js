'use strict';

/**
 * Generalize interface of persisted and real-time messages.
 *
 * @param {string} channel
 * @param {Buffer}  buffer
 * @param {string} [timestamp]
 * @return {{channel: String, data: String, raw: Buffer, timestamp: String}}
 */
module.exports = ({channel, buffer, timestamp}) => {
  let data;
  let decoded = false;
  let error = null;

  function decode() {
    try {
      data = JSON.parse(buffer.toString());
    } catch (err) {
      error = err;
    }
  }

  return {
    channel,
    timestamp: timestamp || new Date().toISOString(),
    get data() {
      if (decoded === false) {
        decode();
        decoded = true;
      }

      return data;
    },
    get error() {
      if (decoded === false) {
        decode();
        decoded = true;
      }

      return error;
    },
    raw: buffer,
  };
};
