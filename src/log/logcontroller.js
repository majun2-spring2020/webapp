const log4js = require('log4js');
var logger = log4js.getLogger();
log4js.configure({
    appenders: {
      out: { type: 'stdout' },
      app: { type: 'file', filename: '/opt/application.log' }
    },
    categories: {
         // getLogger 参数为空时，默认使用该分类
      default: { appenders: [ 'out', 'app' ], level: 'debug' }
    }
});
logger.level= process.env.loggerlevel || 'debug'
module.exports = logger
// logger.info('this is info');
// logger.warn('this is warn');
// logger.error('this is error');
// logger.fatal('this is fatal');
