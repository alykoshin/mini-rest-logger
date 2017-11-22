const _ = require('lodash');
const winston = require('winston');

const AppError = require('mini-rest-errors').AppError;


// http://stackoverflow.com/questions/27524566/how-to-clone-a-javascript-error-into-a-standard-object
const copy_with_enumerable_properties = function (obj) {
  const props = Object.getOwnPropertyNames(obj); // Include non-enumerable properties
  return _.pick(obj, props);
};


const CustomWinston = class extends winston.Logger {

  constructor(options) {
    super(options);
  }

  log(...args) {
    //const winston_log = logger.log;
    //logger.log = function(/* arguments */) {
    //  let args = [...arguments];
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
          //winston_log.call(this, 'error', error.message, error);
          super.log.call(this, 'error', error.message, error);
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
      super.log.call(this, ...args);
      //winston_log.apply(this, args);
    //};

  }

};


module.exports = CustomWinston;
