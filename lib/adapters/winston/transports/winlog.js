const Winlog = (process.platform === 'win32') ? require('winston-winlog3') : null;

const throttler = require('mini-throttle');
let throttle = null;


class Transport {

  constructor(categoryName, config) {
    config.winlog_level  = config.winlog_level || 'info';
    config.winlog_source = config.winlog_source || 'node_app';
    config.winlog_method = config.winlog_method || 'eventcreate';

    const winlogTransport = new (Winlog)({
      level:     config.winlog_level,
      label:     categoryName,
      json:      false,
      //handleExceptions: true,
      timestamp: true,

      source: config.winlog_source,
      method: config.winlog_method
    });

    // replace log() with throttled version
    config.winlog_throttle              = config.winlog_throttle || {};
    config.winlog_throttle.warnInterval = config.winlog_throttle.warnInterval || 1000;
    config.winlog_throttle.onWarn       = function (rejected) {
      winlogTransport.log('warn', 'Due to excessive load rejected ' + rejected + ' messages to Event Log during last ' + config.winlog_throttle.warnInterval + ' milliseconds.');
    };

    // !!! small workaround
    // init throttling function, but only on first call (we need to pass some config)
    if (!throttle) {
      throttle = throttler(config.winlog_throttle);
    }

    const winlogTransport_log = winlogTransport.log;
    winlogTransport.log       = function (level, msg, meta, callback) {
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

    return winlogTransport;
  }

}


module.exports = (process.platform === 'win32') ? Transport : null;
