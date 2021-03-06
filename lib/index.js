'use strict';

var LOG_MOD_NAME = 'winston'; // 'console'; // 'none';
var LOG_MOD_DIR = './adapters/';

var path = require('path');

var adapters = require('require-dir-all')(LOG_MOD_DIR);

var parentModule = require('module-parent')(module, 1);
var parentName = parentModule && path.basename(parentModule.filename, '.js') || 'app';
//var parentName = module.parent && path.basename(module.parent.filename, '.js') || 'app';


/**
 *
 * @param {string} [categoryName='app']
 * @param {Object} options
 * @returns {Object}
 */
var logger = function(categoryName, options) {
  if (arguments.length <= 1) {
    options = categoryName;
    categoryName = parentName;
  }
  return adapters[LOG_MOD_NAME](categoryName, options);
};


module.exports = logger;
