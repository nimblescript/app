var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , ViewHelper = require('../../lib/viewhelper')
  , path = require('path')
  , fs = require('fs')

var ComponentController = new (Controller.extend({}))();

ComponentController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id, { initiator_id: this.req.user && this.req.user.username, initiator_type: 'user' });
};

ComponentController.installed = ViewHelper.controllerAction({}, function ()
{
    var fileSystemBO = this.createBusinessObject('filesystem');
    var baseDirectory = path.join(process.cwd(), 'public/assets/nimblescript');
    var componentsDirectory = path.join(baseDirectory, 'components');
    var components = [];
    var dirContents = fileSystemBO.getDirectoryContents(componentsDirectory);
    dirContents.forEach(function(item)
    { 
        if (item.isDirectory)
        {
            var componentManifestPath = path.join(item.fullPath, 'component.json');
            
            if (fs.existsSync(componentManifestPath))
            {
                try
                {
                    var manifestText = fs.readFileSync(componentManifestPath, 'utf8');
                    var manifest = JSON.parse(manifestText);
                    manifest.Constructor = path.relative(baseDirectory, path.join(item.fullPath, manifest.main)).replace(/\\/g, '/');
                    components.push(manifest);
                }
                catch(e)
                {
                    // Ignore
                }
            }
        }
    })
    this.sendSuccess({ components: components })

});

module.exports = ComponentController;
