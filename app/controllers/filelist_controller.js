var locomotive = require('locomotive')
  , passport = require('passport')
  , Controller = require('../base_controller')
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')

var FileListController = new (Controller.extend({}))();

FileListController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'filelist', { initiator_id: this.req.user && this.req.user.account_id, initiator_type: 'account' });
};

FileListController.search = ViewHelper.controllerAction({}, function ()
{
    var filelistBO = this.createBusinessObject();
    var options = { repository: this.req.param('rep') };
    this.sendSuccess({ filelists: filelistBO.findLists(options) });
});

FileListController.load = ViewHelper.controllerAction({}, function ()
{
    var filelistBO = this.createBusinessObject();
    var options = { path: this.req.param('id') };
    this.sendSuccess({ filelists: filelistBO.loadLists(options) });
});
// FileListController.before('load', middleware.reqAuthAjax);

FileListController.save = ViewHelper.controllerAction({}, function ()
{
    var filelistBO = this.createBusinessObject();
    var options = { path: this.req.param('id'), fileList: JSON.parse(this.req.param('filelist')) };
    filelistBO.saveList(this.req.param('id'), JSON.parse(this.req.param('filelist')));
    this.sendSuccess();
});


FileListController.del = ViewHelper.controllerAction({}, function ()
{
    var filelistBO = this.createBusinessObject();
    filelistBO.deleteList(this.req.param('id'));
    this.sendSuccess();
});


module.exports = FileListController;
