var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , ViewHelper = require('../../lib/viewhelper')
  , middleware = require('../../lib/middleware')
  , config = require('nimblescript-config')

var GeneralController = new (Controller.extend({}))();

GeneralController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id, { initiator_id: this.req.user && this.req.user.account_id, initiator_type: 'account' });
};

GeneralController.home = ViewHelper.controllerAction({}, function ()
{
    var userBO = this.createBusinessObject('user');
    this.settings = userBO.loadSettings();
    this.title = 'Home';
    this.appData = {
        version: config.get('version'),
        platform: process.platform,
        arch: process.arch
    }
    this.render();

});

GeneralController.shutdown = ViewHelper.controllerAction({}, function ()
{
    this.sendSuccess();
    setTimeout(function ()
    {
        process.exit(0);
    },1000);
});
GeneralController.before('shutdown', middleware.reqAuthAjax);

GeneralController.error = ViewHelper.controllerAction({}, function ()
{
    this.title = 'Ooops!';
    this.render('404');
});
module.exports = GeneralController;
