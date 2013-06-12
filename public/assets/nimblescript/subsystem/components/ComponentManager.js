
define(['require', 'jquery', 'underscore', 'Vent', 'App', 'logger', 'backbone','async'],
    function (require, $, _, Vent, App, Logger, Backbone,Async)
    {
        "use strict"




        function ComponentManager()
        {
            this.componentManifests = {};
            this.setState('pre-init');
            _.bindAll(this);
        }

        _.extend(ComponentManager.prototype, Backbone.Events,
            {
                init: function (options)
                {
                    var self = this;
                    this.setState('init');
                    App.serverCommand(
                        {
                            url: '/components/installed',
                            success: function (result)
                            {
                                _.each(result.components, function(componentManifest)
                                {
                                    self.componentManifests[componentManifest.id] = componentManifest;
                                })
                                self.setState('ready');
                                self.trigger('ready');
                            },
                            error: function ()
                            {
                                self.setState('error');
                                self.trigger('ready');
                            }
                        })
                },
                registered: function()
                {
                    return _.map(this.componentManifests, function (c)
                    {
                        return { id: c.id, title: c.title }
                    });
                },
                register: function (componentManifest)
                {

                },
                unregister: function (componentRef)
                {

                },
                state: function()
                {
                    return this._state;
                },
                setState: function(state)
                {
                    if (state != this._state)
                    {
                        this._state = state;
                        this.trigger('state-change', state);
                    }
                },
                get: function (componentIds, callback)
                {
                    var self = this;
                    if (this._state != 'ready')
                        this.on('state-change', function (state)
                        {
                            if (state == 'ready')
                                doGet();
                        })
                    else
                        doGet();

                    function doGet()
                    {
                        var components = [];
                        var componentPaths = [];
                        _.each(componentIds, function (componentId)
                        {
                            var component, componentPath;
                            var componentManifest = self.componentManifests[componentId];
                            if (!componentManifest)
                                return;

                            if (_.isFunction(componentManifest.Constructor))
                            {
                                component = componentManifest.Constructor();
                            }
                            else (_.isString(componentManifest.Constructor))
                            {
                                componentPath = _.toUnixPath(componentManifest.Constructor);
                                
                            }
                            components.push(component);
                            componentPaths.push(componentPath);

                        })
                        require(componentPaths, function ()
                        {
                            var returnedComponents = Array.prototype.slice.call(arguments, 0);
                            for (var i = 0; i < returnedComponents.length; i++)
                            {
                                if (returnedComponents[i])
                                    components[i] = returnedComponents[i];
                            }
                            callback(null, components);
                        });
                    }
                }
            })

        var componentManager = new ComponentManager();
        App.reqres.setHandler('components:getmanager', function ()
        {
            return componentManager;
        })
        App.commands.setHandler('components:get', function (componentIds,callback)
        {
            return componentManager.get(componentIds,callback);
        })

        return componentManager;

    }
);