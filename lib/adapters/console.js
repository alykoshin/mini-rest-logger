'use strict';

var logger = {
  error: console.log.bind(console),
  warn:  console.log.bind(console),
  info:  console.log.bind(console),
  debug: console.log.bind(console),
  silly: console.log.bind(console)
};

module.exports = function(categoryName, config) { return logger; };
