var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , ViewHelper = require('../../lib/viewhelper')
  , path = require('path')
  , fs = require('fs')

var PluginController = new (Controller.extend({}))();

PluginController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id, { initiator_id: this.req.user && this.req.user.username, initiator_type: 'user' });
};

PluginController.installed = ViewHelper.controllerAction({}, function ()
{
    var fileSystemBO = this.createBusinessObject('filesystem');
    var baseDirectory = path.join(process.cwd(), 'public/assets/nimblescript');
    var pluginsDirectory = path.join(baseDirectory, 'plugins');
    var plugins = [];
    var dirContents = fileSystemBO.getDirectoryContents(pluginsDirectory);
    dirContents.forEach(function(item)
    {
        if (item.isDirectory)
        {
            var pluginManifestPath = path.join(item.fullPath, 'plugin.json');
            
            if (fs.existsSync(pluginManifestPath))
            {
                try
                {
                    var manifestText = fs.readFileSync(pluginManifestPath, 'utf8');
                    var manifest = JSON.parse(manifestText);
                    manifest.Constructor = path.relative(baseDirectory, path.join(item.fullPath, manifest.main)).replace(/\\/g,'/');
                    plugins.push(manifest);
                }
                catch(e)
                {
                    console.log(e)
                    // Ignore
                }
            }
        }
    })
    this.sendSuccess({ plugins: plugins })

});

module.exports = PluginController;
