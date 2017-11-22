'use strict';

const path = require('path');
const mkdirp = require('mkdirp');

const winston = require('winston');


function createLogDir(filename) {
  const logDir = path.dirname(filename);
  mkdirp(logDir, function (err) {
    if (err) { throw('Unable to create log directory \'' + logDir + '\': ERROR: ' + err); }
  });
}

class Transport {

  constructor(categoryName, config) {

    config.file_level = config.file_level || 'info';
    config.filename = config.filename || 'log/app.log'; // uses current working dir by default
    config.maxsize  = config.maxsize  || 1000000;       // Size in Bytes
    config.maxFile  = config.maxFiles || 3;

    createLogDir(config.filename);
    const fileTransport    = new (winston.transports.File)({
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

    return fileTransport;
  }

}


module.exports = Transport;
