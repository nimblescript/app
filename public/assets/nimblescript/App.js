define(['backbone', 'vent', 'marionette', 'underscore', 'jquery','swig', 'i18n','logger','async','notify'],
    function (Backbone, Vent, Marionette, _, $, Swig, i18n,Logger, Async, Notify)
    { 

        "use strict";
        var app = new (Marionette.Application.extend({
            constructor: function()
            {
                _.bindAll(this);
                Marionette.Application.prototype.constructor.apply(this, arguments);
            },
            serverCommand: function ()  
            {
                var notice, args = arguments, options = {};
                if (_.isObject(args[0]))
                    options = args[0];
                else if (_.isString(args[0]))
                {
                    options.url = args[0];
                    if (_.isFunction(args[1]))
                    {
                        options.success = function(response)
                        {
                            args[1](null, response);
                        }
                        options.error = function ()
                        {
                            args[1](arguments);
                        }
                    }
                }

                var originalSuccess = options.success;
                var originalError = options.error;
                var newOpts = _.extend({}, options, {
                    cache: false,
                    success: function(a)
                    {
                        notice && notice.pnotify({ text: 'Success' });
                        originalSuccess && originalSuccess(a);

                    },
                    error: function (a,b,c)
                    {
                        notice && notice.pnotify({ text: 'Error' });
                        originalError && originalError(a, b, c);
                    }
                });
                _.defaults(newOpts, { notify: false });
                if (newOpts.blockUI)
                    notice = Notify.notify({ icon: false, delay: 1500, title: 'Server command', text: 'Please wait...', animation: 'none', shadow: false })

                return $.ajax(newOpts);
            },
            // Support array of commands to execute with callback of results
            execute: function ()
            {
                var _super = Marionette.Application.prototype.execute;
                var i = arguments[0];
                var callback = arguments[1];
                if (_.isString(i))
                    _super.apply(this, arguments);
                else if (_.isArray(i))
                {
                    var results = [];
                    var index = 0;
                    var self = this;
                    Async.eachSeries(i, function (item, cb)
                    {
                        _super.call(self, item, function (result)
                        {
                            results[index++] = result;
                            cb();
                        });
                        
                    }, function complete()
                    {
                        callback(results);
                    });
                    
                }
            
            },
            shutdown: function ()
            {
                return this.serverCommand({
                    url: '/shutdown',
                    type: 'POST'
                });
            },
            appInfo: function ()
            {
                return {
                    platform: this.appData.platform,
                    arch: this.appData.arch
                }
            }
        }));


        app.addRegions({
            menubar: '#menubar',
            main: '#main'
        });

        app.commands.setHandler("app:showview", function (view)
        {
            app.main.show(view);
        });
        app.addInitializer(function (options)
        {
            swig.init({
                filters: {
                    prepend: function (text, prependText)
                    {
                        if (prependText)
                        {
                            var parts = text.split('\n');
                            _.each(parts, function (value, i)
                            {
                                parts[i] = prependText + parts[i];
                            });
                            text = parts.join('\n');
                        }
                        return text;
                    }
                }
            });
            Backbone.Marionette.Renderer.render = function (template, data)
            {
                var templateFunc = typeof template === 'function' ? template : Marionette.TemplateCache.get(template);
                var html = templateFunc(data);
                var rendered = Swig.compile(html)(data);
                return $(rendered).i18n();
            }
            this.appData = options;
        })

        return app;
    });
