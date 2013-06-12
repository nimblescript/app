/* Implement proper unit testing */

var common = require('./common');
var userBO = common.businessLibrary.newObject('user');
var settings = userBO.loadSettings();
console.log(settings.scriptsDirectory);
settings.allowedFileAccessDirectories.pop();
userBO.saveSettings(settings);
console.log(userBO.initUser(settings));