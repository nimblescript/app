var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')
  , path = require('path')
  , misc = require('../../lib/misc')

var FilesystemController = new (Controller.extend({}))();
module.exports = FilesystemController;

FilesystemController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'filesystem', { initiator_id: this.req.user && this.req.user.account_id, initiator_type: 'account' });
};

FilesystemController.rootfolders = ViewHelper.controllerAction({}, function ()
{
    var filesystemBO = this.createBusinessObject();

    var options = {
        restrictToAllowed: this.req.param('restricted') == 'true',
        dirOnly: true, checkboxes: this.req.param('checkboxes') == 'true'
    };

    this.sendSuccess({ items: filesystemBO.getRootFolders(options) });

});
FilesystemController.before('rootfolders', middleware.reqAuthAjax);

FilesystemController.foldercontents = ViewHelper.controllerAction({}, function ()
{
    var filesystemBO = this.createBusinessObject();
    var directory = this.req.param('id');
    var options = {
        dirOnly: this.req.param('dironly') == 'true', checkboxes: this.req.param('checkboxes') == 'true'
    };

    var items = filesystemBO.getDirectoryContentsTree(directory, options);

    this.sendSuccess({ items: items });
});

FilesystemController.newfolder = ViewHelper.controllerAction({}, function ()
{
    var filesystemBO = this.createBusinessObject();
    var itemPath = this.req.param('id');
    var result = filesystemBO.newDirectory(itemPath);
    if (result.actioned)
        this.sendSuccess(result);
    else
        this.sendError(result.message, result);

});

FilesystemController.launch = ViewHelper.controllerAction({}, function ()
{
    var filesystemBO = this.createBusinessObject();
    var itemPath = this.req.param('id');
    var allowed = filesystemBO.launch(itemPath);
    this.sendSuccess();

});

FilesystemController.rename = ViewHelper.controllerAction({}, function ()
{
    var filesystemBO = this.createBusinessObject();
    var itemPath = this.req.param('id'),
        newName = this.req.param('newname');
    
    var result = filesystemBO.rename(itemPath, newName);
    if (result.actioned)
        this.sendSuccess(result);
    else
        this.sendError(result.message, result);

});

FilesystemController.del = ViewHelper.controllerAction({}, function ()
{
    var filesystemBO = this.createBusinessObject();
    var itemPath = this.req.param('path');

    var result = filesystemBO.del(itemPath);
    if (result.actioned)
        this.sendSuccess(result);
    else
        this.sendError(result.message, result);

});


