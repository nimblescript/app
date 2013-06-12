var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')
    
var RepositoryController = new (Controller.extend({}))();

RepositoryController.createBusinessObject = function(id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'repository', { initiator_id: this.req.user && this.req.user.account_id, initiator_type: 'account' });
};

/* Return array of repositories for user */
RepositoryController.repositories = ViewHelper.controllerAction({}, function ()
{

    var repositories = this.createBusinessObject().repositoriesForUser();
    this.sendSuccess({ repositories: repositories });
});

RepositoryController.itemChildren = ViewHelper.controllerAction({}, function ()
{

    var repositoryBO = this.createBusinessObject();
    var itemPath = this.req.param('itempath');
    var dirOnly = this.req.param('dironly') == 'true';
    var fileFilter = JSON.parse(this.req.param('fileFilter') || []);
    var self = this;
    var items = repositoryBO.getChildrenTree(itemPath, function (err, items)
    {
        self.sendSuccess({ items: items });
    }, { fileFilter: fileFilter, dirOnly: dirOnly });
    
});

RepositoryController.itemGet = ViewHelper.controllerAction({}, function ()
{
    var repositoryBO = this.createBusinessObject();
    var itemPath = this.req.param('itempath');
    var self = this;
    repositoryBO.getItem(itemPath, function (err,result)
    {
        if (err)
            self.sendError(err,result);
        else
            self.sendSuccess(result)
    });
    
});
// RepositoryController.before('get', middleware.reqAuthAjax);

RepositoryController.itemSave = ViewHelper.controllerAction({}, function ()
{
    var repositoryBO = this.createBusinessObject();
    var itemPath = this.req.param('itempath');
    var content = this.req.param('content');
    var self = this;
    repositoryBO.saveItem(itemPath, content, function (err, result)
    {
        console.log(err, result);
        if (err)
            self.sendError(err,result);
        else
            self.sendSuccess(result)
    });

});

RepositoryController.newFolder = ViewHelper.controllerAction({}, function ()
{
    var repositoryBO = this.createBusinessObject();
    var itemPath = this.req.param('itempath');
    var self = this;
    var result = repositoryBO.newFolder(itemPath, function (err, result)
    {
        if (!err && result.actioned)
            self.sendSuccess(result);
        else
            self.sendError(err || result.message, result);
    });

});

RepositoryController.itemRename = ViewHelper.controllerAction({}, function ()
{
    var repositoryBO = this.createBusinessObject();
    var itemPath = this.req.param('itempath');
    var newName = this.req.param('newname');
    var self = this;
    repositoryBO.renameItem(itemPath, newName, function (err, result)
    {
        if (err || !result.actioned)
            self.sendError(err || result.message, result);
        else
            self.sendSuccess(result)
    });

});

RepositoryController.itemDelete = ViewHelper.controllerAction({}, function ()
{
    var repositoryBO = this.createBusinessObject();
    var itemPath = this.req.param('itempath');
    var self = this;
    repositoryBO.deleteItem(itemPath, function (err, result)
    {
        if (err || !result.actioned)
            self.sendError(err || result.message, result);
        else
            self.sendSuccess(result)
    });

});

RepositoryController.itemAllData = ViewHelper.controllerAction({}, function ()
{

    var repositoryBO = this.createBusinessObject()
    var itemPath = this.req.param('itempath');

    var self = this;
    repositoryBO.itemAllData(itemPath, function (err,result)
    {
        if (err)
            self.sendError(err);
        else
            self.processExecutionResult(result);
    })
});

RepositoryController.itemRun = ViewHelper.controllerAction({}, function ()
{

    var repositoryBO = this.createBusinessObject()
    var itemPath = this.req.param('itempath');
    var settings = JSON.parse(this.req.param('settings'));
    var self = this;
    repositoryBO.itemRun(itemPath, function (err,result)
    {
        
        if (err)
            self.sendError(err);
        else
            self.processExecutionResult(result);
    }, { parameters: settings.parameters, runsettings: settings.runsettings })
});

RepositoryController.itemSummary = ViewHelper.controllerAction({}, function ()
{
    
    var repositoryBO = this.createBusinessObject()
    var itemPath = this.req.param('itempath');

    var self = this;
    repositoryBO.itemSummary(itemPath, function (err,result)
    {
        if (err)
            self.sendError(err);
        else
            self.processExecutionResult(result);
    })
});

RepositoryController.itemParameters = ViewHelper.controllerAction({}, function ()
{

    var repositoryBO = this.createBusinessObject()
    var itemPath = this.req.param('itempath');

    var self = this;
    repositoryBO.itemParameters(itemPath, function (err,result)
    {
        if (err)
            self.sendError(err);
        else
            self.processExecutionResult(result);
    })
});

RepositoryController.processExecutionResult = function (result)
{

    switch (result.outcome)
    {
        case "executed":
            this.sendSuccess({ result: 'executed', returndata: JSON.parse(result.scriptoutput), console: result.console, iteminfo: result.info });
            break;
        case "scripterror":
            this.sendError(result.error, { result: 'scripterror' });
            break;
        case "timeout":
            this.sendError('script.timed_out', { result: 'timeout' });
            break;
        default:
            this.sendError('script.error', { result: 'unknown' });
            break;
    }
};

RepositoryController.templateFind = ViewHelper.controllerAction({}, function ()
{
    var repositoryBO = this.createBusinessObject();
    var options = { rep: this.req.param('rep') };
    var self = this;
    repositoryBO.findTemplates(options, function (err, templates)
    {
        self.sendSuccess({ templates: templates });
    })

})

RepositoryController.templateGet = ViewHelper.controllerAction({}, function ()
{
    var repositoryBO = this.createBusinessObject();
    var itemPath = this.req.param('itempath');
    var self = this;
    repositoryBO.getTemplate(itemPath, function (err, result)
    {
        if (err)
            self.sendError(err);
        else
            self.sendSuccess(result)
    });
})

module.exports = RepositoryController;
