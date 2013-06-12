
define(['require', 'jquery', 'backbone', 'underscore', 'Vent', 'App', 'logger','./ObjectManager'],
    function (require, $, Backbone,_, Vent, App, Logger,ObjectManager)
    {
        "use strict"

        function SettingsManager(options)
        {
            this.sections = {};
        }

        _.extend(SettingsManager.prototype, Backbone.Events,
            {
                registerSection: function (sectionManifest)
                {
                    this.sections[sectionManifest.id] = sectionManifest;
                },
                getSections: function()
                {
                    return this.sections;
                },
                getSectionInstance: function(id,callback)
                {
                    var section = this.sections[id];
                    if (!section || !section.Constructor)
                        return callback(null);

                    if (section.instance)
                        callback(section.instance)
                    else 
                    {
                        section.Constructor(function (sectionInstance)
                        {
                            sectionInstance && _.isFunction(sectionInstance.init) && sectionInstance.init();
                            section.instance = sectionInstance;
                            callback(sectionInstance);
                        })
                    }
                        
                },
                unregisterSection: function (id)
                {
                    var sectionInstance = this.sections[id];
                    if (sectionInstance)
                    {
                        sectionInstance.shutdown();
                        delete this.sections[id];
                    }
                },
                showModal: function (options)
                {
                    App.execute('components:get', ['xemware.nimblescript.component.settings'], function (err, Components)
                    {
                        Components[0].showModal(options);
                    });
                },
                saveSettings: function (settings,callback)
                {
                    if (!_.isObject(settings))
                        return callback && callback();
                    var self = this;
                    App.serverCommand({
                        url: '/user/settings',
                        data: { settings: JSON.stringify(settings) },
                        type: 'POST',
                        success: function (data)
                        {
                            self.lastUserSettings = settings;
                            self.trigger('updated')
                            callback && callback();
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            callback && callback(errorThrown)
                        }
                    })
                },
                loadSettings: function (callback)
                {
                    var self = this;
                    App.serverCommand({
                        url: '/user/settings',
                        success: function (data)
                        {
                            self.lastUserSettings = data.settings;
                            self.trigger('updated');
                            callback(data.settings);
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                        }
                    });
                },
                get: function(toGet)
                {
                    var objectManager = new ObjectManager(this.lastUserSettings);
                    return objectManager.find(toGet);
                },
                set: function (toSet, options,callback)
                {
                    _.isFunction(options) && (callback = options, options = {});
                    options = options || {};

                    var settingsClone = _.cloneDeep(this.lastUserSettings);
                    var objectManager = new ObjectManager(settingsClone);
                    _.each(toSet, function (value, key)
                    {
                        objectManager.update(key, value);
                    })
                    this.saveSettings(settingsClone, callback)
                    
                }
            })


        var setttingsManager = new SettingsManager();

        App.commands.setHandler('settings:show', function ()
        {
            setttingsManager.showModal();
        });

        App.reqres.setHandler('settings:getmanager', function ()
        {
            return setttingsManager;
        })

        // Global handlers for saving settings
        App.commands.setHandler('settings:save', function (settings, callback)
        {
            setttingsManager.saveSettings(settings, callback);
        });

        // Global handler for retrieving settings
        App.commands.setHandler('settings:get', function (callback)
        {
            setttingsManager.loadSettings(callback);
        })


    });