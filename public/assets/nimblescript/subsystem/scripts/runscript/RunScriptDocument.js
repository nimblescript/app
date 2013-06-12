define(['require', 'backbone', 'jquery', 'underscore', 'Vent', 'App', 'modalhelper', 'logger', 'document','notify', 'async'],
    function (require, Backbone, $, _, Vent, App, ModalHelper, Logger, Document, Notify, Async)
    {
        "use strict"

        var RunScriptDocument = Document.extend(
            {
                constructor: function (options)
                {
                    _.bindAll(this);
                    Document.prototype.constructor.apply(this, arguments)
                    this.options = options || {};
                    this._fileSystemManager = App.request('filesystem:getmanager');
                    this._scriptManager = this.options.scriptManager;
                    this._scriptPath = this.options.scriptPath;
                    this._title = this._fileSystemManager.filename(this.options.scriptPath);
                    this._viewCommandQueue = [];

                },
                isNew: false,
                documentType: 'runscript',
                tooltip: function ()
                {
                    return this._scriptPath;
                },
                title: function ()
                {
                    return this._title;
                },
                beforeShow: function ()
                {

                },
                afterShow: function ()
                {
                    _.result(this.view, 'afterShow');
                },
                iconClass: 'icon-play-circle',
                renderContent: function (callback)
                {
                    var notify = Notify.loading({ icon: false, text: 'Loading...' });
                    var self = this;

                    Async.waterfall(
                        [
                            function getScriptData(cb)
                            {
                                self._scriptManager.getAllScriptData(self._scriptPath, function (err, response)
                                {
                                    cb(err || !response.success && response.messages, response);
                                });
                            },
                            function wrapData(data,cb)
                            {
                                self._scriptManager.parseParameters(data.returndata.parameters.params, function(collection)
                                {
                                    cb(null, { scriptpath: self._scriptPath, summary: data.returndata.summary, parameters: collection, runsettings: data.returndata.runsettings, iteminfo: data.iteminfo });
                                });
                            }
                        ],
                        function complete(err, data)
                        {
                            if (err)
                            {
                                var modalHelper = new ModalHelper();
                                modalHelper.on('closed', function ()
                                {
                                    App.request('documents:getmanager').closeDocument(self.container);
                                });
                                modalHelper.error(err);
                                callback();
                                notify.remove();
                            }
                            else
                            {
                                App.execute('components:get', ['xemware.nimblescript.component.scriptrunner'], function (err, Components)
                                {
                                    self.view = Components[0].createView(_.extend({ data: data }, self.options.viewOptions, self.options.settings ));
                                    self.listenTo(self.view, 'all', self.onViewEVent);
                                    var $el = self.view.render().$el;
                                    _.result(self.view,'afterShow');
                                    self.processQueuedViewCommands();
                                    callback($el);
                                    notify.remove();
                                })

                            }
                        });
                },
                close: function ()
                {
                    this.view && this.view.close();
                },
                supportedActions: function ()
                {
                    return [];
                },
                doAction: function (action, options)
                {
                    switch (action)
                    {
                    }
                },
                // Custom
                documentPath: function()
                {
                    return this._scriptPath;
                },
                onViewEVent: function (eVentName, e)
                {
                    switch (eVentName)
                    {
                    }
                },
                queueViewCommand: function (c)
                {
                    if (!this.view)
                        this._viewCommandQueue.push(c);
                    else
                        c.call(this);
                },
                processQueuedViewCommands: function ()
                {
                    var self = this;
                    _.each(this._viewCommandQueue, function (c)
                    {
                        c.call(self);
                    }, this)
                }

            })

        return RunScriptDocument;

    }
)