define(function (require, exports, module)
{
    "use strict"
    
    module.exports = function (register)
    {
        var _ = require('underscore')
            , Backbone = require('backbone')
            , App = require('App')
            , Logger = require('logger')

        init();

        register(
            {
                id: 'xemware.nimblescript.plugin.filelists',
                about: function ()
                {
                    return "File Lists plugin"
                },
                version: function ()
                {
                    return "1.0.0"
                }
            }
        );

        function FileListManager()
        {
            this.cache = {};
        }

        
        _.extend(FileListManager.prototype, Backbone.Events,
            {
                search: function (options)
                {
                    var self = this;
                    options = _.defaults({}, options, { repository: 'local' });
                    var fileLists = [];
                    if (!options.noCache)
                    {
                        fileLists = this.searchCache(options);
                        if (fileLists)
                            return (options.callback && options.callback(null,fileLists));
                    }

                    return App.serverCommand(
                        {
                            url: '/filelists',
                            data: { rep: options.repository },
                            success: function(response)
                            {
                                var lists = self.cache[options.repository] = _.map(response.filelists, function(name)
                                {
                                    return { name: name };
                                });
                                options.callback && options.callback(null,lists);

                            },
                            error: function ()
                            {
                                options.callback && options.callback(arguments);
                            }
                        })
                },
                searchCache: function (options)
                {
                    options = _.defaults({}, options, { repository: 'local' });
                    var repositoryCache = this.cache[options.repository];
                    return !_.isEmpty(repositoryCache) && options.filter
                        ? _.filter(repositoryCache, options.filter)
                        : repositoryCache;
                },
                removeFromCache: function(path)
                {
                    var parts = path.split('*');
                    var repository = parts[0], name = parts[1];
                    var repositoryCache = this.cache[repository];
                    var existingItems = this.searchCache({
                        repository: repository, filter: {
                            name: name
                        }
                    });
                    if (repositoryCache && !_.isEmpty(existingItems) )
                    {
                        _.each(existingItems.reverse(), function(item)
                        {
                            repositoryCache.splice(repositoryCache.indexOf(item), 1);
                        })
                    }

                },
                addToCache: function(path, fileList)
                {
                    var parts = path.split('*');
                    var repository = parts[0], name = parts[1];
                    var existingItems = this.searchCache({ repository: repository, filter: {
                        name: name }
                    });
                    if (_.isEmpty(existingItems))
                    {
                        var repositoryCache = this.cache[repository];
                        if (!repositoryCache)
                            repositoryCache = this.cache[repository] = [];
                        repositoryCache.push({ name: name });
                    }
                },
                loadList: function (path, options)
                {
                    var self = this;
                    options = options || {};
                    return App.serverCommand(
                        {
                            url: '/filelists/' + encodeURIComponent(path),
                            success: function (response)
                            {
                                options.callback && options.callback(null, response.filelists[0]);
                                self.trigger('list:loaded', path, response.filelists[0]);
                            },
                            error: function ()
                            {
                                options.callback && options.callback(arguments);
                            }
                        })
                },
                saveList: function (path, fileList, options)
                {
                    var self = this;
                    options = options || {};
                    return App.serverCommand(
                        {
                            url: '/filelists/' + encodeURIComponent(path),
                            data: { filelist: JSON.stringify(fileList) },
                            type: 'POST',
                            success: function (response)
                            {
                                self.addToCache(path, fileList);
                                // TODO: pass back savedAs
                                options.callback && options.callback(null, response);
                                self.trigger('list:saved', path, fileList);
                            },
                            error: function ()
                            {
                                options.callback && options.callback(arguments);
                            }
                        })
                },
                deleteList: function(path, options)
                {
                    var self = this;
                    options = options || {};
                    return App.serverCommand(
                        {
                            url: '/filelists/' + encodeURIComponent(path),
                            type: 'DELETE',
                            success: function (response)
                            {
                                self.removeFromCache(path);
                                options.callback && options.callback(null);
                                self.trigger('list:deleted', path);
                            },
                            error: function ()
                            {
                                options.callback && options.callback(arguments);
                            }
                        })
                },
                showFileListEditorDoc: function ()
                {
                    require(['document'], function (Document)
                    {
                        App.execute('components:get', ['xemware.nimblescript.component.filelisteditor'], function (err, Components)
                        {
                            var Doc = Document.extend(
                                {
                                    constructor: function ()
                                    {
                                        _.bindAll(this);
                                        Document.prototype.constructor.apply(this, arguments);
                                    },
                                    title: 'File List Editor',
                                    fileListEditor: true,
                                    renderContent: function (callback)
                                    {
                                        this.view = Components[0].createView();
                                        var self = this;
                                        this.listenTo(this.view, 'ready', function ()
                                        {
                                            callback(self.view.$el);
                                            self.trigger('ready');
                                        });
                                        this.view.render().$el;
                                    },
                                    afterShow: function ()
                                    {
                                        this.view.fileListView.updateColumnSizing();
                                    }
                                })
                            var documentManager = App.request('documents:getmanager');
                            documentManager.addDocument(new Doc);
                        });
                    });

                }
            })

        
        function init()
        {
            var filelistManager = new FileListManager();
            App.reqres.setHandler('filelists:getmanager', function ()
            {
                return filelistManager;
            })

            addToMenu();

            var documentManager = App.request('documents:getmanager');
            documentManager.listenTo(documentManager, 'all', function(eVentName, e)
            {
                
            })

            App.commands.setHandler('filelists:filelisteditordoc', function ()
            {
                filelistManager.showFileListEditorDoc();
            });

        }


        function addToMenu()
        {
            var menuManager = App.request('menu:getmanager');
            var editMenu = menuManager.findMenu('edit');
            var editPosition = menuManager.collection.models.indexOf(editMenu);
            var toolsMenu = menuManager.findMenu('tools');
            if (_.isEmpty(toolsMenu))
            {
                menuManager.collection.add([{
                    id: 'tools',
                    label: 'Tools',
                    href: '#',
                    subitems: new Backbone.Collection()
                }], { at: editPosition + 1 });
            }
            toolsMenu = menuManager.findMenu('tools');
            toolsMenu.get('subitems').add([
                {
                    id: 'tools.filelisteditor',
                    label: 'File List Editor',
                    href: '#',
                    command: 'filelists:filelisteditordoc'
                }]
               );
        }

    }
}
);