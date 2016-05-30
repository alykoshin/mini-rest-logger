'use strict';

function none() {};

var logger = {
  error: none,
  warn:  none,
  info:  none,
  debug: none,
  silly: none
};

module.exports = function(categoryName, config) { return logger; };
