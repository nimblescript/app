define(['require', 'jquery', 'underscore', 'Vent', 'App','backbone', 'logger', 'async'],
    function (require, $, _, Vent, App, Backbone, Logger, Async)
    {
        "use strict"



        function PluginManager()
        {
            this.setState('pre-init');
        }

        _.extend(PluginManager.prototype, Backbone.Events,
            {
                init: function (options)
                {
                    this.plugins = {};
                    var self = this;
                    this.loadPlugins(function ()
                    {
                        self.trigger('ready');
                    });
                },
                state: function ()
                {
                    return this._state;
                },
                setState: function (state)
                {
                    if (state != this._state)
                    {
                        this._state = state;
                        this.trigger('state-change', state);
                    }
                },
                loadPlugins: function (callback)
                {
                    var self = this;
                    this.setState('init');
                    App.serverCommand(
                        {
                            url: '/plugins/installed',
                            success: function (result)
                            {
                                self.registerPlugins(result.plugins, callback);
                            },
                            error: function ()
                            {
                                self.setState('error');
                            }
                        })

                    
                },
                registerPlugins: function(pluginManifests, callback)
                {
                    var self = this;
                    Async.eachSeries(pluginManifests, function (pluginManifest, cb)
                    {
                        self.register(pluginManifest, function(err)
                        {
                            cb();
                        });
                    }, function complete()
                    {
                        self.setState('ready');
                        callback();
                    });
                },
                getPlugin: function (pluginId)
                {
                    if (!this.plugins[pluginId])
                        return;

                    return this.plugins[pluginId];

                },
                register: function (pluginManifest, cb)
                {
                    this.plugins[pluginManifest.id] = pluginManifest;
                    require([pluginManifest.Constructor], function (module)
                    {
                        pluginManifest.instance = module(function (instance)
                        {
                            cb(instance);

                        });
                    })

                },
                unregister: function (pluginId)
                {
                    delete this.plugins[pluginId];
                },
            })

        var pluginManager = new PluginManager();

        App.reqres.setHandler('plugins:getmanager', function ()
        {
            return pluginManager;
        })


        return pluginManager;
    }
);