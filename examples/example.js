/**
 * Created by alykoshin on 06.03.16.
 */

var logger1 = require('../')({});

logger1.silly('silly');
logger1.debug('debug');
logger1.info('info');
logger1.warn('warn');
logger1.error('error');

var logger2 = require('../')('logger2', {
    "console_level": "silly",

    "winlog_level": "info",
    "winlog_source": "awl-client",
    "description": [
      "Configuration for throttling of application messages to EventLog:",
      "- maxCalls     - max number of calls during observation interval",
      "- interval     - observation interval",
      "- warnInterval - interval to output info about the number of rejected messages"
    ],

  "file_level": "debug",
    "filename": "./log/app.log",
    "maxsize": 1000000,
    "maxFiles": 10
  }
);

logger2.silly('silly');
logger2.debug('debug');
logger2.info('info');
logger2.warn('warn');
logger2.error('error');
