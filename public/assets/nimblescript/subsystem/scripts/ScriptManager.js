define(['require','jquery', 'underscore', 'Vent', 'App', 'logger', 'backbone','./editscript/EditScriptDocument','./runscript/RunScriptDocument','mousetrap', 
    'async'],
    function (require,$, _, Vent, App, Logger, Backbone,EditScriptDocument, RunScriptDocument, Mousetrap, Async)
    {
        "use strict"

        var documentManager, repositoryManager;
        App.on('subsystems:loaded', function ()
        {
            documentManager = App.request('documents:getmanager');
            repositoryManager = App.request('repository:getmanager');
            addScriptsMenu();
        })

        App.commands.setHandler('ui:set-script-editor-theme', function (theme)
        {
            var scriptDocuments = documentManager.getDocuments({ type: 'script' });
            _.each(scriptDocuments, function(doc)
            {
                doc.setEditorTheme(theme);
            })
        });

        function ScriptManager()
        {
            this._scripts = {};
            this._parameterTypes = {};
        }

        _.extend(ScriptManager.prototype, Backbone.Events,
            {
                init: function (options)
                {
                    var self = this;
                    _.bindAll(this);
                    this.trigger('ready');
                    this.listenTo(this, 'script:run:after', function (e)
                    {
                        if (e.response && e.response.success)
                            self.addToLocalRunHistory(e.scriptpath, e.settings);
                    });
                },
                openScript: function (path, options)
                {
                    var options = _.defaults({}, options, { viewOptions: { showDetails: true, showParameters: true } });
                    var doc = this.newRunScriptDocument({ scriptPath: path, viewOptions: options.viewOptions, settings: options.settings } );
                    documentManager.addDocument(doc);

                },
                runScript: function(path, settings, callback)
                {
                    var self = this;
                    this.customTrigger('script', 'run:before', { scriptpath: path, settings: settings } );
                    return repositoryManager.itemCommand(path, 'run', function (err, response)
                    {
                        self.customTrigger('script', 'run:after', { scriptpath: path, settings: settings, err: err, response: response });
                        callback && callback(err, response);
                    }, { settings: JSON.stringify(settings) })

                },
                newRunScriptDocument: function(options)
                {
                    return new RunScriptDocument(_.extend(
                        { repositoryManager: repositoryManager, scriptManager: this}, options));
                },
                newEditScriptDocument: function(options)
                {
                    return new EditScriptDocument(_.extend(
                        { repositoryManager: repositoryManager, scriptManager: this}, options));
                },
                editScript: function (path, options)
                {
                    var existingDoc = documentManager.getDocuments(function (doc)
                    {
                        return _.result(doc, 'documentType') == 'editscript' && _.result(doc, 'documentPath') == path;
                    })
                    if (existingDoc[0])
                        documentManager.showDocument(existingDoc[0]);
                    else
                    {
                        var doc = this.newEditScriptDocument({ scriptPath: path });
                        documentManager.addDocument(doc);
                    }

                },
                newScript: function (options)
                {
                    var doc = this.newEditScriptDocument();
                    documentManager.addDocument(doc);

                },
                newScriptFromTemplate: function(options)
                {
                    var self = this;
                    var templateManager = App.request('templates:getmanager');
                    templateManager.showTemplateBrowser({
                        filter: 'scripts',
                        onOpen: function (template)
                        {
                            if (template)
                            {
                                templateManager.executeTemplate(template, {
                                    action: 'returncontent',
                                    onComplete: function (err, result)
                                    {
                                        if (!err)
                                        {
                                            var doc = self.newEditScriptDocument({ initialContent: result.content });
                                            documentManager.addDocument(doc);
                                        }
                                    }
                                })
                            }
                        }
                    });
                },
                getAllScriptData: function(path, callback)
                {
                    repositoryManager.itemCommand(path, 'alldata', function (err, response)
                    {
                        callback && callback(err, response);
                    })
                },
                getScriptRunSettings: function (path, callback)
                {
                    repositoryManager.itemCommand(path, 'runsettings', function (err, response)
                    {
                        callback && callback(err, response);
                    })
                },
                getScriptSummary: function (path, callback)
                {
                    repositoryManager.itemCommand(path, 'summary', function (err, response)
                    {
                        callback && callback(err, response);
                    })
                },
                getScriptParameters: function (path, callback)
                {
                    repositoryManager.itemCommand(path, 'parameters', function (err, response)
                    {
                        callback && callback(err, response);
                    })
                },
                registerParameterType: function (options)
                {
                    this._parameterTypes[options.id] = options;
                },
                parameterTypes: function ()
                {
                    return this._parameterTypes;
                },
                /**
                 * Parse a regular object array of parameters and return Backbone.Collection instance
                 *
                 * @param {array} data The array
                 * @return {Backbone.Collection} Backbone.Collection
                 */
                parseParameters: function (data, callback)
                {
                    var self = this;
                    var collection = new Backbone.Collection();
                    Async.eachSeries(data, function (param, cb)
                    {
                        self.createTypeWrapper(param, function(instance)
                        {
                            instance && collection.add(instance.model);
                            cb();
                        })
                    },
                    function complete()
                    {
                        callback(collection);
                    });
                    
                },
                createTypeWrapper: function (param, callback)
                {
                    var paramType = this._parameterTypes[param.type];
                    if (paramType)
                    {
                        paramType.Constructor(function (paramTypeInstance)
                        {
                            if (paramTypeInstance)
                            {
                                var p = _.extend({}, param, { typeWrapper: paramTypeInstance });
                                paramTypeInstance.model = new Backbone.Model(p);
                            }
                            callback(paramTypeInstance);
                        })
                    }
                    else
                        callback();

                },
                getSavedParameters: function(options,callback)
                {
                    return App.serverCommand({
                        url: '/savedparam',
                        success: function (response)
                        {
                            callback && callback(response.message, _.result(response,'items'));
                        },
                        error: function ()
                        {
                            callback && callback(arguments);
                        }

                    })
                },
                loadSavedParameters: function (name, callback)
                {
                    return App.serverCommand({
                        url: '/savedparam/' + encodeURIComponent(name),
                        success: function (response)
                        {
                            callback && callback(!response.item.actioned && response.item.message, JSON.parse(response.item.content));
                        },
                        error: function ()
                        {
                            callback && callback(arguments);
                        }
                    });
                },
                saveParameters: function (name, settings, callback)
                {
                    var self = this;
                    return App.serverCommand({
                        url: '/savedparam/' + encodeURIComponent(name),
                        type: 'PUT',
                        data: { values: JSON.stringify(settings.values) },
                        success: function (response)
                        {
                            self.customTrigger('params', 'saved', name, settings);
                            callback && callback(null, response);
                        },
                        error: function ()
                        {
                            callback && callback(arguments);
                        }
                    });
                },
                deleteSavedParameters: function (name, callback)
                {
                    var self = this;
                    return App.serverCommand({
                        url: '/savedparam/' + encodeURIComponent(name),
                        type: 'DELETE',
                        success: function (response)
                        {
                            self.customTrigger('params', 'deleted', name);
                            callback && callback(null, response);
                        },
                        error: function ()
                        {
                            callback && callback(arguments);
                        }
                    });
                },
                // Run History
                loadRunHistory: function(callback)
                {
                    var self = this;
                    return App.serverCommand({
                        url: 'runner/history',
                        success: function (response)
                        {
                            self._runHistory = response.history;
                            callback && callback(null,response.runhistory);
                        },
                        error: function ()
                        {
                            callback && callback(arguments);
                        }
                    });
                },
                getRunHistory: function (callback)
                {
                    if (_.isUndefined(this._runHistory))
                        this.loadRunHistory(callback);
                    else
                        callback && callback(null, this._runHistory);
                },
                addToLocalRunHistory: function (scriptPath, settings)
                {
                    
                },
                customTrigger: function (parentType, eVentName)
                {
                    var args = Array.prototype.slice.call(arguments, 2);
                    this.trigger.apply(this, [parentType, eVentName].concat(args));
                    this.trigger.apply(this, [parentType + ':' + eVentName].concat(args));
                },
                scriptName: function (path)
                {
                    return repositoryManager.filename(path);
                }


            })

        var scriptManager = new ScriptManager();

        App.reqres.setHandler('scripts:getmanager', function ()
        {
            return scriptManager;
        });

        App.commands.setHandler('scripts.command', function (menu)
        {
            switch (menu.id)
            {
                case "scripts.new":
                    scriptManager.newScriptFromTemplate();
                    break;
            }
        });

        // Insert Scripts menu before Edit
        function addScriptsMenu()
        {

            var menuManager = App.request('menu:getmanager');
            var editMenu = _.first(menuManager.collection.where({ id: 'edit' }));
            var editPosition = menuManager.collection.models.indexOf(editMenu);
            menuManager.collection.add({
                id: 'scripts',
                label: 'Scripts',
                href: '#',
                subitems: new Backbone.Collection([
                    {
                        id: 'scripts.new',
                        label: 'New',
                        href: '#',
                        action: 'new',
                        command: 'scripts.command',
                        shortcut: 'Alt-N'
                    }
                ]
                )
            }, { at: editPosition })
        }

        // Base Parameter Types for scripts
        scriptManager.registerParameterType(
            { type: 'text', id: 'text', title: 'Text', Constructor: _.bind(createParameter, { path: './parameters/Text' }) });
        scriptManager.registerParameterType(
            { type: 'number', id: 'number', title: 'Number', Constructor: _.bind(createParameter, { path: './parameters/Number' }) });
        scriptManager.registerParameterType(
            { type: 'boolean', id: 'boolean', title: 'Boolean', Constructor: _.bind(createParameter, { path: './parameters/Boolean' }) });
        scriptManager.registerParameterType(
            { type: 'date', id: 'date', title: 'Date', Constructor: _.bind(createParameter, { path: './parameters/Date' }) });
        scriptManager.registerParameterType(
            { type: 'color', id: 'color', title: 'Color', Constructor: _.bind(createParameter, { path: './parameters/Color' }) });
        scriptManager.registerParameterType(
            { type: 'selection', id: 'selection', title: 'Selection', Constructor: _.bind(createParameter, { path: './parameters/Selection' }) });
        scriptManager.registerParameterType(
            { type: 'fileSystem', id: 'fileSystem', title: 'File System', Constructor: _.bind(createParameter, { path: './parameters/FileSystem' }) });


        function createParameter(callback)
        {
            require([this.path], function (Parameter)
            {
                callback(Parameter ? new Parameter() : null);
            })
        }

        // New script
        Mousetrap.bind('alt+n', function (e)
        {
            scriptManager.newScriptFromTemplate();
            return false;
        });

        return scriptManager;
    }
    );