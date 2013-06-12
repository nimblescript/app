
define(['require', 'jquery', 'underscore', 'Vent', 'App', 'logger'],
    function (require, $, _, Vent, App, Logger)
    {
        "use strict"

        function ModuleManager()
        {
        }

        _.extend(ModuleManager.prototype, Backbone.Events,
            {
                installedModules: function (callback)
                {
                    App.serverCommand({
                        url: '/modules',
                        success: function (data)
                        {
                            callback && callback(data.modules);
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            callback && callback();
                        }
                    });

                }
            });

        var moduleManager = new ModuleManager();

        App.reqres.setHandler('modules:getmanager', function ()
        {
            return moduleManager;
        });

        App.commands.setHandler('modules:installed', function (callback)
        {
            moduleManager.installedModules(callback);
        });

        return moduleManager;



    }
);