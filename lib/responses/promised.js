'use strict';

module.exports = fn =>
  new Promise((resolve, reject) => {
    fn((err, ...args) => {
      if (err) return reject(err);

      return args.length ? resolve(...args) : resolve();
    });
  });
