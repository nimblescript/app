var locomotive = require('locomotive')
    , logger = require('nimblescript-logger')
    , os = require('os')
    , path = require('path')
    
var config = require('nimblescript-config');
config.load();

// This logger will be shared by all other modules in the process as it is the default instance
logger.config({ toConsole: true, toFile: true, directory: 'logs' });
logger.info('---------------------------------------------');
logger.info('App Startup');
 
process.on('uncaughtException', function (err)
{
    logger.error('uncaught exception' + os.EOL + err.stack);
});
 
options = {};
options.address = options.address || '0.0.0.0';
options.port = config.get('webServer:port') || options.port || process.env.PORT || 3000;
options.env = options.env || process.env.NODE_ENV || 'production';
options.callback = function (err, http, express)
{
    // require('socket.io').listen(express);
};
locomotive.cli.server(process.cwd(), options.address, options.port, options.env, options);
