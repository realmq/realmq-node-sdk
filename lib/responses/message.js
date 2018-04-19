'use strict';

/**
 * Generalize real-time messages.
 *
 * @param channel
 * @param buffer
 * @return {{channel: *, data: *, raw: Buffer}}
 */
module.exports = ({channel, buffer}) => {
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
