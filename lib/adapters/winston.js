'use strict';

var path = require('path');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var winston = require('winston');
var winlog2 = (process.platform === 'win32') ? require('winston-winlog3') : null;
var AppError = require('mini-rest-errors').AppError;
var throttler = require('mini-throttle');
var throttle = null;



function createLogDir(filename) {
  var logDir = path.dirname(filename);
  mkdirp(logDir, function (err) {
    if (err) { throw('Unable to create log directory \'' + logDir + '\': ERROR: ' + err); }
  });
}

// http://stackoverflow.com/questions/27524566/how-to-clone-a-javascript-error-into-a-standard-object
const copy_with_enumerable_properties = function (obj) {
  const props = Object.getOwnPropertyNames(obj); // Include non-enumerable properties
  return _.pick(obj, props);
};

var newCategory = function(categoryName, config) {
  var logger;

  categoryName = categoryName || 'undefined';
  var transports = [];

  config = config || {};
  config.console_level = config.console_level || 'info';

  var consoleTransport = new (winston.transports.Console)({
    level:            config.console_level,
    label:            categoryName,
    json:             false,
    //handleExceptions: true,
    timestamp:        true,

    colorize:  true
  });
  transports.push(consoleTransport);

  config.file_level = config.file_level || 'info';
  config.filename = config.filename || 'log/app.log'; // uses current working dir by default
  config.maxsize  = config.maxsize  || 1000000;       // Size in Bytes
  config.maxFile  = config.maxFiles || 3;

  createLogDir(config.filename);
  var fileTransport    = new (winston.transports.File)({
    level:            config.file_level,
    label:            categoryName,
    json:             false,
    //handleExceptions: true,
    timestamp:        true,

    tailable: true,
    filename: config.filename,
    maxsize:  config.maxsize,
    maxFiles: config.maxFiles
  });
  transports.push(fileTransport);


  if (winlog2) {

    config.winlog_level  = config.winlog_level  || 'info';
    config.winlog_source = config.winlog_source || 'node_app';
    config.winlog_method = config.winlog_method || 'eventcreate';

    var winlogTransport = new (winlog2)({
      level:            config.winlog_level,
      label:            categoryName,
      json:             false,
      //handleExceptions: true,
      timestamp:        true,

      source: config.winlog_source,
      method: config.winlog_method
    });

    // replace log() with throttled version
    config.winlog_throttle = config.winlog_throttle || {};
    config.winlog_throttle.warnInterval = config.winlog_throttle.warnInterval || 1000;
    config.winlog_throttle.onWarn = function(rejected) {
      logger.warn('Due to excessive load rejected '+rejected+' messages to Event Log during last '+config.winlog_throttle.warnInterval+' milliseconds.');
    };

    // !!! small workaround
    // init throttling function, but only on first call (we need to pass some config)
    if (!throttle) {
      throttle = throttler(config.winlog_throttle);
    }

    var winlogTransport_log = winlogTransport.log;
    winlogTransport.log = function(level, msg, meta, callback) {
      //var levels = winston.levels; // as we do not change levels for specific transports, we may take global winston levels
      //// levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
      //if (levels[level] <= levels[config.winlog_level]) {
      //  // Message with this level will be logged
      //  console.log('>>> ' + level + ' ok      ('+levels[level] +'/'+levels[config.winlog_level]+')');
      //} else {
      //  console.log('>>> ' + level + ' skipped ('+levels[level] +'/'+levels[config.winlog_level]+')');
      //}

      // log() method for the transport is called only if `level` of this message is allowed by transport's level
      // that means, messages are already filtered by level
      // and we must throttle each call to log()
      return throttle.call(this, winlogTransport_log, level, msg, meta, callback);
    };

    // add to Winston transports

    transports.push(winlogTransport);
  }

  logger = winston.loggers.add(categoryName, {
    transports: transports
  });


  // override Winston's log() function with new handler
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
