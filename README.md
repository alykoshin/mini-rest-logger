[![npm version](https://badge.fury.io/js/mini-rest-logger.svg)](http://badge.fury.io/js/mini-rest-logger)
[![Build Status](https://travis-ci.org/alykoshin/mini-rest-logger.svg)](https://travis-ci.org/alykoshin/mini-rest-logger)
[![Coverage Status](https://coveralls.io/repos/alykoshin/mini-rest-logger/badge.svg?branch=master&service=github)](https://coveralls.io/github/alykoshin/mini-rest-logger?branch=master)
[![Code Climate](https://codeclimate.com/github/alykoshin/mini-rest-logger/badges/gpa.svg)](https://codeclimate.com/github/alykoshin/mini-rest-logger)
[![Inch CI](https://inch-ci.org/github/alykoshin/mini-rest-logger.svg?branch=master)](https://inch-ci.org/github/alykoshin/mini-rest-logger)

[![Dependency Status](https://david-dm.org/alykoshin/mini-rest-logger/status.svg)](https://david-dm.org/alykoshin/mini-rest-logger#info=dependencies)
[![devDependency Status](https://david-dm.org/alykoshin/mini-rest-logger/dev-status.svg)](https://david-dm.org/alykoshin/mini-rest-logger#info=devDependencies)


# mini-rest-logger

Winston-based logger for mini-rest project with console, file, winlog (win32 only) transports


If you have different needs regarding the functionality, please add a [feature request](https://github.com/alykoshin/mini-rest-logger/issues).


## Installation

```sh
npm install --save mini-rest-logger
```

## Usage

### Simple

```js
var logger1 = require('../')({});

logger1.silly('silly');
logger1.debug('debug');
logger1.info('info');
logger1.warn('warn');
logger1.error('error');
```

### Advanced

```js
var logger2 = require('../')('logger2', {
    "console_level": "silly",

    "winlog_level": "info",
    "winlog_source": "awl-client",

    "file_level": "debug",
    "filename": "./log/app.log",
    "maxsize": 1000000,
    "maxFiles": 10,
 
    "instantiateLimit": 10,  // change instantiation warning limit
  }
);

logger2.silly('silly');
logger2.debug('debug');
logger2.info('info');
logger2.warn('warn');
logger2.error('error');
```

```sh
$ node examples/example.js 
2016-03-06T21:13:00.035Z - info: [index] info
2016-03-06T21:13:00.038Z - warn: [index] warn
2016-03-06T21:13:00.039Z - error: [index] error
2016-03-06T21:13:00.041Z - silly: [logger2] silly
2016-03-06T21:13:00.041Z - debug: [logger2] debug
2016-03-06T21:13:00.041Z - info: [logger2] info
2016-03-06T21:13:00.041Z - warn: [logger2] warn
2016-03-06T21:13:00.042Z - error: [logger2] error
```


## Credits
[Alexander](https://github.com/alykoshin/)


# Links to package pages:

[github.com](https://github.com/alykoshin/mini-rest-logger) &nbsp; [npmjs.com](https://www.npmjs.com/package/mini-rest-logger) &nbsp; [travis-ci.org](https://travis-ci.org/alykoshin/mini-rest-logger) &nbsp; [coveralls.io](https://coveralls.io/github/alykoshin/mini-rest-logger) &nbsp; [inch-ci.org](https://inch-ci.org/github/alykoshin/mini-rest-logger)


## License

MIT
