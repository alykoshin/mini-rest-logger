const util = require('util');

const winston = require('winston');
// Requiring `winston-syslog` will expose
// `winston.transports.Syslog`
//require('winston-syslog');
require('winston-rsyslog');

// Mapping of custom application error levels to Syslog error levels
const LEVEL_MAP = {
  // Application : Syslog
  //'force': 'emerg',
  'force': 'alert',
  //'force': 'crit'
  'error': 'error',
  'warn':  'warn',
  'info':  'notice',
  'debug': 'info',
  'silly': 'debug',
};


class Transport {

  constructor(categoryName, config) {
    // facility: Facility index (default 0, valid values are from 0 to 23)
    // 16 : local use 0 (local0)
    if (typeof(config.facility) === 'undefined') config.facility = 16;
    // tag: A tag to name the application for easy log filtering (default is 'winston')
    if (typeof(config.tag)      === 'undefined') config.tag = categoryName;
    //
    const transport = new (winston.transports.Rsyslog)(config);
    //const transport = new (winston.transports.Syslog)(config);

    const originalLog = transport.log;
    transport.log = function(appLevel, msg, meta, callback) {
      // convert to syslog levels
      const sylogLevel = LEVEL_MAP[appLevel] || 'notice';
      // `meta` object is ignored by `rsyslog` module, so we need to add it to `msg`
      if (meta) {
        //const metaStr = util.inspect(meta);
        const metaStr = JSON.stringify(meta);
        msg += ': More Info: ' + metaStr;
      }
      // call original method
      originalLog.call(this, sylogLevel, msg, meta, callback);

      return transport;
    };

  }

}


module.exports = Transport;
