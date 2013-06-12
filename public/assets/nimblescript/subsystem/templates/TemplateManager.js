define(['require', 'jquery', 'underscore', 'Vent', 'App', 'backbone', 'logger', 'async'],
    function (require, $, _, Vent, App, Backbone, Logger, Async)
    {
        "use strict"



        function TemplateManager()
        {
            this.setState('pre-init');
        }

        _.extend(TemplateManager.prototype, Backbone.Events,
            {
                init: function (options)
                {
                    this.templates = {};
                    var self = this;
                    this.loadTemplates(function ()
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
                loadTemplates: function (callback)
                {
                    var self = this;
                    this.setState('init');
                    App.serverCommand(
                        {
                            url: '/repository/templates',
                            success: function (result)
                            {
                                self.registerTemplates(result.templates, callback);
                            },
                            error: function ()
                            {
                                self.setState('error');
                            }
                        })


                },
                registerTemplates: function (templateManifests, callback)
                {
                    var self = this;
                    Async.eachSeries(templateManifests, function (templateManifest, cb)
                    {
                        self.register(templateManifest, function (err)
                        {
                            cb();
                        });
                    }, function complete()
                    {
                        self.setState('ready');
                        callback();
                    });
                },
                getTemplates: function (options)
                {
                    return this.templates;

                },
                register: function (templateManifest, cb)
                {
                    this.templates[templateManifest.id] = templateManifest;
                    cb();
                },
                unregister: function (templateId)
                {
                    delete this.templates[templateId];
                },
                showTemplateBrowser: function (options)
                {
                    App.execute('components:get', ['xemware.nimblescript.component.templatebrowser'], function(err,Components)
                    {
                        Components[0].showModal({
                            title: 'New script...',
                            onOpen: function (template)
                            {
                                options.onOpen && options.onOpen(template);
                            },
                            onClose: function (buttonText, template)
                            {
                                options.onClose && options.onClose(buttonText, template);
                            }
                        });
                    })
                },
                executeTemplate: function (templateRef, options)
                {
                    options = options || {};
                    var template = _.isString(templateRef) ? this.templates[templateRef] : templateRef;
                    if (!_.isObject(template))
                    {
                        options.onComplete && options.onComplete('invalidtemplate');
                        return;
                    }

                    switch (template.type)
                    {
                        case 'text':
                            this.getFileContent(template.id, done);
                            break;
                        case 'function':
                            template.Constructor(done);
                            break;
                    }

                    function done(err, result)
                    {
                        options.onComplete && options.onComplete(err, result);
                    }
                },
                getFileContent: function (path, callback)
                {
                    App.serverCommand({
                        url: '/repository/template/' + encodeURIComponent(path),
                        success: function (result)
                        {
                            callback(!result.success && result.message, result)
                        },
                        error: function ()
                        {
                            callback(Array.prototype.slice.call(arguments, 0));
                        }

                    });
                }
            })

        var templateManager = new TemplateManager();

        App.reqres.setHandler('templates:getmanager', function ()
        {
            return templateManager;
        })


        return templateManager;
    }
);