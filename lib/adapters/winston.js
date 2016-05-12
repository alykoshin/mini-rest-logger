'use strict';

var winston = require('winston');
var mkdirp = require('mkdirp');
var path = require('path');
var winlog2 = (process.platform === 'win32') ? require('winston-winlog2') : null;
var throttler = require('mini-throttle');
var throttle = null;

var rejected = 0;


function createLogDir(filename) {
  var logDir = path.dirname(filename);
  mkdirp(logDir, function (err) {
    if (err) { throw('Unable to create log directory \'' + logDir + '\': ERROR: ' + err); }
  });
}

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

    var winlogTransport = new (winlog2)({
      level:            config.winlog_level,
      label:            categoryName,
      json:             false,
      //handleExceptions: true,
      timestamp:        true,

      source: config.winlog_source
    });

    // replace log() with throttled version
    config.winlog_throttle = config.winlog_throttle || {};
    config.winlog_throttle.warnInterval = config.winlog_throttle.warnInterval || 1000;
    config.winlog_throttle.onReject = function() {
      rejected++;
    };

    // !!! small workaround
    // init throttling function, but only on first call (we need to pass some config)
    if (!throttle) {
      throttle = throttler(config.winlog_throttle);
    }

    var winlogTransport_log = winlogTransport.log;
    winlogTransport.log = function(level, msg, meta, callback) {
      return throttle.call(this, winlogTransport_log, level, msg, meta, callback);
    };
    setInterval(function() {
      if (rejected > 0) {
        logger.warn('Due to excessive load rejected '+rejected+' messages to Event Log during last '+config.winlog_throttle.warnInterval+' milliseconds.');
        rejected = 0;
      }
    }, config.winlog_throttle.warnInterval);

    // add to Winston transports

    transports.push(winlogTransport);
  }

  logger = winston.loggers.add(categoryName, {
    transports: transports
  });


  return logger;
};


module.exports = newCategory;
