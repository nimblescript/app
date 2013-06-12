var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')
  , path = require('path')
    
var ModuleController = new (Controller.extend({}))();

ModuleController.createBusinessObject = function(id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'module', { initiator_id: this.req.user && this.req.user.username, initiator_type: 'account' });
};

ModuleController.get = ViewHelper.controllerAction({}, function ()
{
});
ModuleController.before('get', middleware.reqAuthAjax);

ModuleController.installed = ViewHelper.controllerAction({}, function ()
{
    var userBO = this.createBusinessObject('user');
    var settings = userBO.loadSettings();

    var moduleBO = this.createBusinessObject();
    var scanDirectories = [path.join(process.cwd(), 'modules'), path.join(settings.userDataDirectory, 'modules')];
    var modules = moduleBO.findModules(scanDirectories);
    this.sendSuccess({ modules: modules })
});
ModuleController.before('installed', middleware.reqAuthAjax);

module.exports = ModuleController;
