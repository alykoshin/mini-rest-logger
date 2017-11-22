'use strict';

const winston = require('winston');
const CustomLogger = require('./winston/customLogger');

const ConsoleTransport  = require('./winston/transports/console');
const FileTransport  = require('./winston/transports/file');
const WinlogTransport  = require('./winston/transports/winlog');
const RsyslogTransport = require('./winston/transports/rsyslog');


let instantiateCount = 0;
let DEFAULT_INSTANTIATE_LIMIT = 10;


const customLevels = {
  levels: {
    force: 0,
    error: 1,
    warn:  2,
    info:  3,
    debug: 4,
    silly: 5,
  },
  colors: {
    force: 'cyan',
    error: 'red',
    warn:  'yellow',
    info:  'green',
    debug: 'blue',
    silly: 'magenta',
  }
};


const newCategory = function(categoryName, config) {
  let logger;

  function checkInstantionCount() {
    instantiateCount++;
    if (instantiateCount > config.instantiateLimit) logger.warn('mini-rest-logger package was instantiated more than ' + instantiateCount + ' times. Sequential instantiation of this may be a reason for stack overflow. You may turn off this warning by changing instantiateCount property of config parameter passed to the constructor');
  }

  categoryName = categoryName || 'undefined';
  const transports = [];

  config = config || {};
  config.instantiateLimit = config.instantiateLimit || DEFAULT_INSTANTIATE_LIMIT;

  transports.push( new ConsoleTransport(categoryName, config));
  transports.push( new FileTransport(categoryName, config) );
  if (WinlogTransport) transports.push( new WinlogTransport(categoryName, config) );
  if (RsyslogTransport && config.rsyslog) transports.push( new RsyslogTransport(categoryName, config.rsyslog) ); // https://www.npmjs.com/package/winston-syslog

  // initialize logger

  // instantiate logger object
  logger = new CustomLogger({
    transports: transports,
  });
  // Set new log levels
  logger.setLevels(customLevels.levels);
  // Set colors for new log levels
  winston.addColors(customLevels.colors);

  // to warn about possible stack wasting due to sequential overriding of `.log` method
  checkInstantionCount();

  return logger;
};


module.exports = newCategory;
