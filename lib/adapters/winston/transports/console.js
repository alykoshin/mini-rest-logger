const winston = require('winston');


class Transport {

  constructor(categoryName, config) {

    // console transport

    config.console_level = config.console_level || 'info';

    const consoleTransport = new (winston.transports.Console)({
      level:     config.console_level,
      label:     categoryName,
      json:      false,
      //handleExceptions: true,
      timestamp: true,

      colorize: true
    });

    return consoleTransport;
  }

}


module.exports = Transport;
