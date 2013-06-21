define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', '../folderbrowser/FolderBrowserView', 'jquery.contextmenu',
    'text!./repositorybrowser.html', 'css!./repositorybrowser.css', 'modalhelper'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, FolderBrowserView, $contextmenu, html, css, ModalHelper)
    {
        "use strict"
        /* TODO: Look to extend FolderBrowserView instead */
        return Marionette.Layout.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.Layout.prototype.constructor.apply(this, arguments);
                },
                regions: {
                    folderBrowser: '.folderbrowser'
                },
                template: Swig.compile(html),
                tagName: 'div',
                className: 'repository-browser',
                initialize: function (options)
                {
                    this.options = _.defaults({}, options, { executeNodeActions: true });
                    this._repositoryManager = App.request('repository:getmanager');
                    this._scriptManager = App.request('scripts:getmanager');
                    this._fileSystemManager = App.request('filesystem:getmanager');

                },
                onRender: function ()
                {
                    this.populate();
                },
                listenToEvents: function ()
                {
                    var self = this;
                    // Bubble events
                    this.listenTo(this.folderBrowserView, 'all', function (eVentName,tree,node)
                    {
                        if (eVentName == 'node:dblclick' && !node.data.isFolder)
                            self.executeNodeAction({ node: node, action: 'run' })
                        self.trigger.apply(self, arguments)
                    });
                    this.listenTo(this, 'node:action', this._onNodeAction)

                    this.listenTo(this._repositoryManager, 'item:renamed', this._onExternalRenamed);
                    this.listenTo(this._repositoryManager, 'item:deleted', this._onExternalDeleted);
                    this.listenTo(this._repositoryManager, 'item:added', function (e) { this._onExternalAddSave('added', e) });
                    this.listenTo(this._repositoryManager, 'item:saved', function (e) { this._onExternalAddSave('saved', e) });
                },
                // RepositoryManager eVent handler
                _onExternalRenamed: function (path, newName)
                {
                    var node = this.folderBrowserView.tree.getNodeByKey(path);
                    if (node)
                    {
                        node.setTitle(newName);
                        var directory = this._fileSystemManager.directory(path);
                        node.data.key = directory + '/' + newName;
                    }

                },
                // RepositoryManager eVent handler
                _onExternalDeleted: function (path)
                {
                    var node = this.folderBrowserView.tree.getNodeByKey(path);
                    if (node)
                    {
                        var parentNode = node.getParent();
                        node.remove();
                        parentNode.activate();
                    }
                },
                // RepositoryManager eVent handler
                _onExternalAddSave: function (eVentType, itemInfo)
                {
                    if (eVentType == 'added')
                    {
                        var node = this.folderBrowserView.tree.getNodeByKey(itemInfo.path);
                        var newNode;
                        if (node && _.isArray(node.getChildren()))
                            newNode = node.addChild({ key: itemInfo.path + '/' + itemInfo.name, title: itemInfo.name, isFolder: itemInfo.type == 'folder', isLazy: true });

                        if (this._inNewFolder && newNode) // New folder added by this instance, enter edit mode
                        {
                            this._inNewFolder = false;
                            this.folderBrowserView.renameNode(newNode);

                        }
                    }
                    else // saved, must be a file item
                    {
                        var existingNode = this.folderBrowserView.tree.getNodeByKey(itemInfo.path);
                        if (existingNode)
                            return;

                        var directory = this._fileSystemManager.directory(itemInfo.path);
                        var node = this.folderBrowserView.tree.getNodeByKey(directory);
                        if (node && _.isArray(node.getChildren()))
                        {
                            node.addChild({ key: itemInfo.path, title: this._fileSystemManager.filename(itemInfo.path), isFolder: false, isLazy: false});
                        }

                    }
                },
                _onNodeAction: function (actionData)
                {
                    if (this.options.executeNodeActions)
                        this.executeNodeAction(actionData);
                },
                executeNodeAction: function (actionData)
                {

                    switch (actionData.action)
                    {
                        case 'edit':
                            this._scriptManager.editScript(actionData.node.data.key);
                            break;
                        case 'newscript':
                            this._scriptManager.newScriptFromTemplate();
                            break;
                        case 'refresh':
                            actionData.node.reloadChildren();
                            break;
                        case 'rename':
                            this.folderBrowserView.renameNode(actionData.node);
                            break;
                        case 'delete':
                            this.folderBrowserView.deleteNode(actionData.node);
                            break;
                        case 'newfolder':
                            this.newFolder(actionData.node);
                            break;
                        case 'run':
                            this._scriptManager.openScript(actionData.node.data.key, { viewOptions: { showDetails: true, showParameters: true } });
                            break;
                    }
                },
                initFolderBrowser: function (repositoryNodes)
                {
                    var opts = _.extend({}, this.options, {
                        initialNodes: repositoryNodes,
                        onContextMenu: this._onContextMenu,
                        lazyUrl: function (node)
                        {
                            // Dynamic path for lazy loading of nodes
                            return {
                                url: '/repository/item/' + encodeURIComponent(node.data.key) + '/children',
                                data: { fileFilter: JSON.stringify(['.*\\.ns']), dironly: opts.dironly }
                            }
                        },
                        allowRename: true,
                        renameHandler: this._onRenameItem,
                        deleteHandler: this._onDeleteItem,
                        postProcess: this.onTreePostProcess
                        /*
                        dnd: {
                            callback: this.onDNDEvent
                        }*/

                    })
                    this.folderBrowserView = new FolderBrowserView(opts);
                    this.folderBrowser.show(this.folderBrowserView);
                    this.listenToEvents();
                },
                onDNDEvent: function(e)
                {
                },
                onTreePostProcess: function (data, dataType)
                {
                    if (this.folderBrowserView.tree.isInitializing())
                    {
                        // Insert a 'Root' root for initial data
                        var rootData = { title: 'Repositories', isSystem: true, isFolder: true, key: 'System', children: data.items, isLazy: true };
                        return rootData;
                    }
                    else
                        return data.success && data.items;
                },
                populate: function ()
                {
                    var self = this;
                    this._repositoryManager.getRepositories(true, function (err, repositories)
                    {
                        var repositoryNodes = [];
                        _.each(repositories, function (repositoryInfo)
                        {
                            repositoryNodes.push({ title: repositoryInfo.title, isFolder: true, key: repositoryInfo.id + '*' + repositoryInfo.path, isLazy: true, storeType: repositoryInfo.storeType, isRoot: true, repositoryId: repositoryInfo.id });
                        })

                        var data = { title: 'Repositories', isSystem: true, isFolder: true, key: 'System', children: repositoryNodes, isLazy: false };

                        if (!self.folderBrowserView)
                        {
                            self.initFolderBrowser(data);
                        }
                        else
                        {
                            self.folderBrowserView.syncChildNodes(self.folderBrowserView.tree.getRoot().getChildren()[0], repositoryNodes)
                        }
                    });


                },
                _onDeleteItem: function(path, callback)
                {
                    var node = this.folderBrowserView.tree.getNodeByKey(path);
                    var repositoryNode = getTopParent(node);
                    this._repositoryManager.deleteItem(path, callback);
                },
                _onRenameItem: function(path, newName, callback)
                {
                    var node = this.folderBrowserView.activeNode();
                    var repositoryNode = getTopParent(node);
                    this._repositoryManager.renameItem(path, newName, callback);
                },
                _onContextMenu: function (node, span)
                {
                    var self = this;
                    var opts = {
                        callback: function (key, options)
                        {
                            self.trigger('node:action', { node: node, action: key });
                        }
                    };

                    // TODO: Support permissions for server based repository stores
                    var permissions = node.data.permissions;

                    if (node.data.isSystem)
                    {
                        opts.items = {
                            'disabled': { name: 'No options', disabled: true }
                        }
                    }
                    else if (node.data.isFolder)
                    {
                        opts.items = {
                            "newscript": { name: "New Script" },
                            "newfolder": { name: "New Folder" },
                            "refresh": { name: "Refresh" }
                        };
                        if (!node.data.isRoot)
                        {
                            _.extend(opts.items, {
                                "sep1": "-------",
                                "rename": { name: "Rename" },
                                "paste": { name: "Paste", disabled: true },
                                "delete": { name: "Delete" }
                            })
                        }
                    }
                    else
                    {
                        opts.items = {
                            "run": { name: "Run" },
                            "edit": { name: "Edit" },
                            "sep1": "-------",
                            "copy": { name: "Copy", disabled: true },
                            "paste": { name: "Paste", disabled: true },
                            "delete": { name: "Delete" },
                            "rename": { name: "Rename" }
                        }
                    }
                    return opts;
                },
                getRoot: function ()
                {
                    return this.folderBrowserView.getRoot();
                },
                activeNode: function ()
                {
                    return this.folderBrowserView.activeNode()
                },
                setDirectory: function (path)
                {
                    this.folderBrowserView.setDirectory(path);
                },
                newFolder: function (parentNode)
                {
                    this._inNewFolder = true;
                    this._repositoryManager.newFolder(parentNode.data.key, function (err, response)
                    {
                        if (err || !response.success)
                        {
                            this._inNewFolder = false;
                            // TODO: App. helper for error handling/messages
                            var errorText;
                            if (err)
                                errorText = 'Some error..';
                            else
                            {
                                if (!response.success)
                                    errorText = response.messages.join('<br/>');
                            }
                            if (errorText)
                            {
                                var modalHelper = new ModalHelper();
                                modalHelper.alert({ title: 'New Folder', text: response.messages.join(',') });
                            }

                        }
                    });
                    // Let handler for item:added do it's thing and unset this._inAdd
                }
            });

        function getTopParent(node)
        {
            var currentNode = node;
            while (currentNode.getParent() && currentNode.getParent().getParent())
                currentNode = currentNode.getParent();
            return currentNode;
        }
    }
)
