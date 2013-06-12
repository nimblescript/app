var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , ViewHelper = require('../../lib/viewhelper')
  , path = require('path')
  , fs = require('fs')

var WidgetController = new (Controller.extend({}))();

WidgetController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id, { initiator_id: this.req.user && this.req.user.username, initiator_type: 'user' });
};

WidgetController.installed = ViewHelper.controllerAction({}, function ()
{
    var fileSystemBO = this.createBusinessObject('filesystem');
    var baseDirectory = path.join(process.cwd(), 'public/assets/nimblescript');
    var widgetsDirectory = path.join(baseDirectory, 'widgets');
    var widgets = [];
    var dirContents = fileSystemBO.getDirectoryContents(widgetsDirectory);
    dirContents.forEach(function(item)
    {
        if (item.isDirectory)
        {
            var widgetManifestPath = path.join(item.fullPath, 'widget.json');
            
            if (fs.existsSync(widgetManifestPath))
            {
                try
                {
                    var manifestText = fs.readFileSync(widgetManifestPath, 'utf8');
                    var manifest = JSON.parse(manifestText);
                    manifest.Constructor = path.relative(baseDirectory, path.join(item.fullPath, manifest.main)).replace(/\\/g,'/');
                    widgets.push(manifest);
                }
                catch(e)
                {
                    // Ignore
                }
            }
        }
    })
    this.sendSuccess({ widgets: widgets })

});

module.exports = WidgetController;
