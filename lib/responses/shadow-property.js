'use strict';

module.exports = ({target, property, value}) =>
  Object.defineProperty(target, property, {
    value,
    enumerable: false,
  });
