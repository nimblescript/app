var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')

var RunnerController = new (Controller.extend({}))();

RunnerController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'runner', { initiator_id: this.req.user && this.req.user.account_id, initiator_type: 'account' });
};

RunnerController.status = ViewHelper.controllerAction({}, function ()
{
    var instanceId = this.req.param('id');
    this.sendSuccess({ id: scriptPath });
});
RunnerController.before('status', middleware.reqAuthAjax);

RunnerController.stop = ViewHelper.controllerAction({}, function ()
{
    var scriptPath = this.req.param('id');
    this.sendSuccess({ id: scriptPath });
});
RunnerController.before('stop', middleware.reqAuthAjax);

RunnerController.history = ViewHelper.controllerAction({}, function ()
{
    var runnerBO = this.createBusinessObject();
    var history = runnerBO.loadRunHistory();
    this.sendSuccess({ runhistory: history });
});
RunnerController.before('history', middleware.reqAuthAjax);

module.exports = RunnerController;
