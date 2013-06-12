/* Implement proper unit testing */


var logger = require('nimblescript-logger')
    , os = require('os')
    , path = require('path')

// This logger will be shared by all other snackle modules in the process as it is the default instance
logger.config({ toConsole: true, toFile: true, directory: 'logs' });

// 
var config = require('nimblescript-config');
config.options.config_file_path = '../config/config.json';
config.load();

var RepositoryLibrary = require(config.get('repository-library:module'));
var BusinessLibrary = require(config.get('business-library:module'));
var repositoryLibraryInstance = new RepositoryLibrary.constructor();
BusinessLibrary.repositoryLibrary = repositoryLibraryInstance;

module.exports = {
    repositoryLibrary: RepositoryLibrary,
    businessLibrary: BusinessLibrary,
    logger: logger,
    config: config
}

