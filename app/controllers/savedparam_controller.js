var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')
  , path = require('path')
  , misc = require('../../lib/misc')

var SavedParamController = new (Controller.extend({}))();
module.exports = SavedParamController;

SavedParamController.createBusinessObject = function(id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'savedparam', { initiator_id: this.req.user && this.req.user.account_id, initiator_type: 'account' });
};

SavedParamController.search = ViewHelper.controllerAction({}, function ()
{
    var savedParamBO = this.createBusinessObject();
    var self = this;
    savedParamBO.search({}, function (err, savedParamList)
    {
        err ? self.sendError(err) : self.sendSuccess({ items: savedParamList});
    });
});
SavedParamController.before('search', middleware.reqAuthAjax);

SavedParamController.get = ViewHelper.controllerAction({}, function ()
{
    var savedParamBO = this.createBusinessObject();
    var self = this;
    savedParamBO.get(this.param('id'), function (err, data)
    {
        err ? self.sendError(err) : self.sendSuccess({ item: data });
    });
});
SavedParamController.before('get', middleware.reqAuthAjax);

SavedParamController.del = ViewHelper.controllerAction({}, function ()
{
    var savedParamBO = this.createBusinessObject();
    var self = this;
    savedParamBO.del(this.param('id'), function (err)
    {
        err ? self.sendError(err) : self.sendSuccess();
    });
});
SavedParamController.before('del', middleware.reqAuthAjax);

SavedParamController.save = ViewHelper.controllerAction({}, function ()
{
    var savedParamBO = this.createBusinessObject();
    var self = this;
    savedParamBO.save(this.param('id'), JSON.parse(this.req.body.values), function (err)
    {
        err ? self.sendError(err) : self.sendSuccess();
    });
});
SavedParamController.before('save', middleware.reqAuthAjax);


module.exports = SavedParamController;
