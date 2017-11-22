'use strict';

const _ = require('lodash');
const winston = require('winston');

const ConsoleTransport  = require('./winston/transports/console');
const FileTransport  = require('./winston/transports/file');
const WinlogTransport  = require('./winston/transports/winlog');
const RsyslogTransport = require('./winston/transports/rsyslog');

const AppError = require('mini-rest-errors').AppError;

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


// http://stackoverflow.com/questions/27524566/how-to-clone-a-javascript-error-into-a-standard-object
const copy_with_enumerable_properties = function (obj) {
  const props = Object.getOwnPropertyNames(obj); // Include non-enumerable properties
  return _.pick(obj, props);
};

const newCategory = function(categoryName, config) {
  let logger;

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
  logger = winston.loggers.add(categoryName, {
    transports: transports
  });
  // Set new log levels
  logger.setLevels(customLevels.levels);
  // Set colors for new log levels
  winston.addColors(customLevels.colors);

  // to warn about possible stack wasting due to sequential overriding of `.log` method

  instantiateCount++;
  if (instantiateCount > config.instantiateLimit) logger.warn('mini-rest-logger package was instantiated more than '+instantiateCount+' times. Sequential instantiation of this may be a reason for stack overflow. You may turn off this warning by changing instantiateCount property of config parameter passed to the constructor');


  // override Winston's log() function with new handler
  // to preprocess parameters

  const winston_log = logger.log;
  logger.log = function(/* arguments */) {
    let args = [...arguments];
    let level = args.shift();
    let msg   = args.shift();
    let meta  = args.shift();
    //if (arguments.length === 3) callback = meta;
    //if (arguments.length === 2) callback = meta;

    // if first argument is object, treat it as meta
    if (typeof level === 'object') {
      meta = level;

      // if meta is AppError, get extended error definition
      if (meta instanceof AppError) {
        const def = AppError.errors[meta.code] || {};
        // not implemented at the moment
      }

      // if meta is Error, make a copy and remove stack property if needed
      if (meta instanceof Error) {
        const error_obj = copy_with_enumerable_properties(meta);
        //error_obj.stack = error_obj.stack.split('\n');
        if (error_obj.hideStack) delete error_obj.stack;
        //if (meta.hideStack) delete meta.stack;
        meta = error_obj;
      }

      // take log level from meta object
      if (typeof meta.level === 'string') {
        level = meta.level;
      } else {
        const error = new Error('Object passed as first parameter to winston.log(), however, its level property is invalid');
        winston_log.call(this, 'error', error.message, error);
        level = 'error';
      }

      if (typeof msg === 'undefined') {
        let s = '';
        s += meta.message ? meta.message : '[No message]';
        //s += meta.message ? 'Message: "' + meta.message + '"' : '';
        //s += meta.details ? ' Details: "' + meta.details + '"' : '';
        //s += msg ? ' More Info: "' + msg + '"' : '';
        msg   = s;
      }

    }

    args.unshift(level, msg, meta);
    winston_log.apply(this, args);
  };

  return logger;
};


module.exports = newCategory;
