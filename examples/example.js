/**
 * Created by alykoshin on 06.03.16.
 */

var logger1 = require('../')({});

logger1.silly('silly');
logger1.debug('debug');
logger1.info('info');
logger1.warn('warn');
logger1.error('error');
logger1.force('force');

var logger2 = require('../')('logger2', {

  // console transport
  'console_level': 'silly',

  // file transport
  file_level: 'debug',
  filename: __dirname + '/log/app.log',
  maxsize: 1000000,
  maxFiles: 10,

  // winlog transport
  winlog_level: 'info',
  winlog_source: 'awl-client',
  description: [
    'Configuration for throttling of application messages to EventLog:',
    '- maxCalls     - max number of calls during observation interval',
    '- interval     - observation interval',
    '- warnInterval - interval to output info about the number of rejected messages'
  ],

  // syslog transport
  // https://www.npmjs.com/package/winston-syslog
  syslog: {
    host: 'localhost',
    protocol: 'udp4',
  },

  // options for all transports
  instantiateLimit: 10,
});

logger2.silly('silly');
logger2.debug('debug');
logger2.info('info');
logger2.warn('warn');
logger2.error('error');


const meta = { level: 'info', message: 'meta_message', id: 1 };
logger2.log(meta, 'log_message')

const err1 = new Error('Error with stack trace');
err1.level = 'warn';
logger2.log(err1, 'error msg');

const err2 = new Error('Error without stack trace');
err2.level = 'warn';
err2.hideStack = true;
logger2.log(err2);

const err3 = new Error('Error without stack trace and log msg');
err3.level = 'warn';
err3.hideStack = true;
logger2.log(err3);

