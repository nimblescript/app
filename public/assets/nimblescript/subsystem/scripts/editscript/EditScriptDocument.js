define(['require', 'backbone', 'jquery', 'underscore', 'Vent', 'App', 'modalhelper', 'logger', 'document', 'notify', 'translate'],
    function (require, Backbone, $, _, Vent, App, ModalHelper, Logger, Document, Notify, T)
    {
        "use strict"

        var EditScriptDocument = Document.extend(
            {
                constructor: function (options)
                {
                    _.bindAll(this);
                    Document.prototype.constructor.apply(this, arguments)
                    this._fileSystemManager = App.request('filesystem:getmanager');


                    this.options = options || {};
                    this._newFile = _.isEmpty(this.options.scriptPath);
                    this._scriptPath = this.options.scriptPath;
                    this._title = this._newFile ? 'New Script' : this._fileSystemManager.filename(this.options.scriptPath);
                    this._repositoryManager = this.options.repositoryManager;
                    this._scriptManager = this.options.scriptManager;
                    this._viewCommandQueue = [];
                    this._modified = false;

                },
                isNew: function ()
                {
                    return this._isNew;
                },
                documentType: 'editscript',
                tooltip: function ()
                {
                    return this._newFile ? this.title() : this._scriptPath;
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

                    this.queueViewCommand(function () { this.view.focus(); });
                },
                iconClass: 'icon-edit',
                renderContent: function (callback)
                {
                    var notify = Notify.loading({ icon: false, text: 'Loading...' });
                    var self = this;
                    App.execute('components:get', ['xemware.nimblescript.component.scripteditor'], function (err, Components)
                    {
                        self.view = Components[0].createView();
                        self.listenTo(self.view, 'all', self.onViewEVent);
                        // TODO: Perhaps better to load document earlier in pipeline before renderContent so errors can be handled 
                        // before a Document is added to container.
                        if (self.options.initialContent)
                        {
                            self.setContent(self.options.initialContent, { callback: done })
                        }
                        else if (self._scriptPath)
                        {
                            self.loadScript(function ()
                            {
                                done();
                            });
                        }
                        else
                            done();

                        function done()
                        {
                            var $el = self.view.render().$el;
                            self.processQueuedViewCommands();
                            callback($el);
                            notify.remove();
                        }
                    })

                },
                loadScript: function (callback)
                {
                    var self = this;
                    this._repositoryManager.getItem(this._scriptPath, function (err, script)
                    {
                        self.setContent(script.content, { callback: callback })
                    });

                },
                setContent: function (content, options)
                {
                    // TODO: Look at timing of events to not require setTimeout
                    this.view.setContent(content, { clearUndo: true });
                    // Let everything catch up
                    setTimeout(function ()
                    {
                        options.callback && options.callback();
                    }, 0);

                },
                isDirty: function ()
                {
                    return this._modified;
                },
                beforeClose: function ()
                {
                    var self = this;
                    if (!this.isDirty())
                        return true;
                    else
                    {
                        new ModalHelper().alert({
                            buttons: [{ text: T.t('misc.yes'), name: 'yes' }, { text: T.t('misc.no'), name: 'no' }, { text: T.t('misc.cancel'), name: 'cancel' }],
                            text: T.t('script.save_before_close'),
                            onButton: function (name)
                            {
                                switch (name)
                                {
                                    case 'yes':
                                    case 'no':
                                        self.documentManager.closeDocument(self.container.documentId, { force: true });
                                        break;
                                }
                                return true;
                            }
                        })
                    }
                    return !this.isDirty();
                },
                close: function ()
                {
                    this.view.close();
                },
                supportedActions: function ()
                {
                    var a = ['cut', 'copy', 'paste', 'save', 'saveas'];
                    if (this.view.canUndo())
                        a.push('undo');
                    if (this.view.canRedo())
                        a.push('redo');

                    return a;
                },
                doAction: function (action, options)
                {
                    switch (action)
                    {
                        case 'cut':
                            this.view.cut();
                            break;
                        case 'copy':
                            this.view.copy();
                            break;
                        case 'paste':
                            this.view.paste();
                            break;
                        case 'save':
                            this.save();
                            break;
                        case 'saveas':
                            this.saveAs();
                            break;
                        case 'undo':
                            this.view.undo();
                            this._modified = this.view.canUndo();
                            break;
                        case 'redo':
                            this.view.redo();
                            break;

                    }
                },
                // Custom
                documentPath: function ()
                {
                    return this._scriptPath;
                },
                setEditorTheme: function (theme)
                {
                    this.view.setEditorTheme(theme);
                },
                onViewEVent: function (eVentName, e)
                {
                    switch (eVentName)
                    {
                        case 'changed':
                            this._modified = this.view.canUndo();
                            this.trigger('changed');
                            break;
                        case 'run':
                            this.run();
                            break;
                        case 'publish':
                            this.publish();
                            break;
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
                },
                publish: function ()
                {
                    var self = this;
                    this.mustBeSavedCheck(function (result)
                    {
                        if (result)
                        {
                            App.execute('components:get', ['xemware.nimblescript.component.publishscript'], function (err, Components)
                            {
                                Components[0].showModal({ scriptPath: self._scriptPath });
                            });
                        }
                    });
                },
                run: function ()
                {
                    var self = this;
                    this.mustBeSavedCheck(function (result)
                    {
                        if (result)
                            self._scriptManager.openScript(self._scriptPath, { viewOptions: { showDetails: true, showParameters: true } });
                    });
                },
                mustBeSavedCheck: function (callback)
                {
                    var self = this;
                    if (this._newFile || this.isDirty())
                    {
                        new ModalHelper().alert({
                            buttons: [{ text: T.t('misc.yes'), name: 'yes' }, { text: T.t('misc.no'), name: 'no' }],
                            text: T.t('script.must_be_saved'),
                            onButton: function (name)
                            {
                                switch (name)
                                {
                                    case 'yes':
                                        self.save(null,
                                            function (saved)
                                            {
                                                callback(saved);
                                            });
                                        break;
                                }
                                return true;
                            }
                        })
                    }
                    else
                        callback(true);

                },
                save: function (options, callback)
                {
                    options = options || {};

                    if (this._newFile && !options.path)
                        return this.saveAs(options, callback);


                    var scriptPath = options.path || this._scriptPath;
                    var self = this;
                    this._repositoryManager.saveItem(scriptPath, this.view.getContent(),
                        function (err, response)
                        {
                            if (response && response.success)
                            {
                                self._modified = false;
                                self._newFile = false;
                                self._scriptPath = scriptPath;
                                self._title = self._fileSystemManager.filename(scriptPath);
                                self.trigger('saved');
                            }
                            callback && callback(response && response.success)


                        }
                    )
                },
                saveAs: function (options, callback)
                {
                    var self = this;
                    App.execute('components:get', ['xemware.nimblescript.component.repositoryexplorer'], function (err, Components)
                    {
                        var initialFilename = self._newFile ? self._title + '.ns' : self._fileSystemManager.filename(self._scriptPath);
                        var initialPath = self._newFile ? null : self._fileSystemManager.directory(self._scriptPath);
                        var modal = Components[0].showModal({
                            mode: 'save',
                            overwritePrompt: true,
                            initialFilename: initialFilename,
                            initialPath: initialPath,
                            onOK: function (selectedItems)
                            {
                                var dir = modal.getDirectory(), filename = modal.getFilename();
                                if (!filename.endsWith('.ns'))
                                    filename += '.ns';
                                self.save(_.defaults({ path: dir + '/' + filename }, options), callback);
                                return true;
                            }
                        });

                    });
                }

            })

        return EditScriptDocument;

    }
)