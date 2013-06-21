define(['require', 'jquery', 'underscore', 'marionette', 'App', 'logger', '../tree/TreeView', 'swig', 'async', 'text!./folderbrowser.html', 'jquery.scrollintoview',
    'modalhelper', 'translate'],
    function (require, $, _, Marionette, App, Logger, TreeView, Swig, Async, html, $jqueryScrollIntoView, ModalHelper,T)
    {
        "use strict"

        return Marionette.Layout.extend({
            template: Swig.compile(html),
            className: 'folder-tree',
            constructor: function ()
            {
                _.bindAll(this);
                Marionette.Layout.prototype.constructor.apply(this, arguments);
            },
            initialize: function (options)
            {
                this._fileSystemManager = App.request('filesystem:getmanager');

                this.options = _.defaults({}, options, {
                    restricted: true, dironly: false, selectionMode: 'single', resizeToParent: true,
                    initialAjaxUrl: '/filesystem/rootfolders',
                    initialAjaxData: { restricted: true, dironly: true },
                    lazyUrl: function (node)
                    {
                        return {
                            url: '/filesystem/' + encodeURIComponent(node.data.key) + '/foldercontents',
                            data: { dironly: options.dironly, checkboxes: options.selectionMode === 'multiple', restricted: options.restricted }
                        };
                    },
                    onContextMenu: this.onContextMenu,
                    nodeActionOnContext: 'focus',
                    allowRename: true,
                    renameHandler: this._fileSystemManager.renameItem,
                    deleteHandler: this._fileSystemManager.deleteItem,
                    deleteConfirm: true

                });
                
                this.listenTo(this._fileSystemManager, 'renamed', this._onExternalRenamed);
                this.listenTo(this._fileSystemManager, 'deleted', this._onExternalDeleted);
                this.listenTo(this._fileSystemManager, 'added', this._onExternalAdded);

            },
            onRender: function ()
            {
                this.insertTree();
                if (this.options.resizeToParent)
                {
                    this.$el.css('height', 'calc(100% - 6px)');
                    this.$el.css('height', '-moz-calc(100% - 6px)');
                    this.$el.css('height', '-webkit-calc(100% - 6px)');
                }
            },
            insertTree: function ()
            {
                this.tree = new TreeView(
                    {
                        initialAjaxUrl: this.options.initialAjaxUrl,
                        initialNodes: this.options.initialNodes,
                        initialAjaxData: this.options.initialAjaxData,
                        onCreate: this.options.onCreate,
                        postProcess: this.options.postProcess || this.onTreePostProcess,
                        onPostInit: this.options.onPostInit || this.onTreePostInit,
                        postLazyRead: this.options.postLazyRead || this.onTreePostLazyRead,
                        lazyUrl: this.options.lazyUrl,
                        selectionMode: this.options.selectionMode,
                        dironly: this.options.dironly,
                        allowRename: this.options.allowRename,
                        onContextMenu: this.options.onContextMenu,
                        nodeActionOnContext: this.options.nodeActionOnContext,
                        dnd: this.options.dnd
                    });
                this.$el.append(this.tree.render().$el);
                this.listenTo(this.tree, 'all', this.onTreeEVent)
            },
            onTreePostProcess: function (data, dataType)
            {
                if (this.tree.isInitializing())
                {
                    // Insert a 'Root' root for initial data
                    var rootData = { title: 'System', isSystem: true, isFolder: true, key: 'System', hideCheckbox: true, children: data.items, isLazy: true };
                    return rootData;
                }
                else
                    return data.success && data.items;
            },
            onTreeEVent: function (eVentName)
            {
                var tree, node;
                var startingArg = eVentName == 'node' ? 2 : 1;
                var tree = arguments[startingArg], node = arguments[startingArg + 1];
                switch (eVentName)
                {
                    case 'node:select':
                        var selected = arguments[startingArg + 2];
                        this.onTreeNodeSelect(node, selected);
                        break;
                }
                this.trigger.apply(this, arguments);
            },
            onTreeNodeSelect: function (node, selected)
            {
                if (this.options.dironly)
                    return;
                if (selected && node.hasChildren() == undefined) // lazy node not yet loaded
                {
                    this.tree.tree.selectChildrenOnLazyRead = true;
                    node.toggleExpand();
                }
                else if (node.hasChildren() === true)
                {
                    var newNodes = node.getChildren();
                    $.each(newNodes, function (index, newNode)
                    {
                        if (!newNode.data.isFolder)
                            newNode.select(selected);
                    });

                }

            },
            onTreePostInit: function ()
            {
                var self = this;
                setTimeout(function ()
                {
                    self.options.initialPath && self.setDirectory(self.options.initialPath);
                    self._firstTime = false;
                }, 0);
            },
            onTreePostLazyRead: function (node)
            {
                // TODO: Remove when onExpand called by this
                this.customTrigger('node', 'expand', this.tree, node, true);

                if (this.options.dironly || this.options.selectionMode == 'single')
                    return;

                if (this.tree.tree.selectChildrenOnLazyRead)
                {
                    var newNodes = node.getChildren();
                    if (newNodes)
                    {
                        $.each(newNodes, function (index, newNode)
                        {
                            if (!newNode.data.isFolder)
                                newNode.select(true);
                        });
                    }
                    this.tree.selectChildrenOnLazyRead = false;
                }
            },
            onContextMenu: function (node, span)
            {
                var self = this;
                var opts = {
                    callback: function (key, options)
                    {
                        switch (key)
                        {
                            case 'rename':
                                self.renameNode(node);
                                break;
                            case 'delete':
                                self.deleteNode(node);
                                break;
                            case 'refresh':
                                if (node.data.isSystem)
                                    self.tree.reload();
                                else
                                    node.reloadChildren();
                                break;
                            case 'newfolder':
                                self.newFolder(node);
                        }
                    },
                    items: {}
                };


                // TODO: Support permissions 
                var permissions = node.data.permissions;

                if (!node.data.isSystem)

                    _.extend(opts.items, {
                        'newfolder': { name: 'New Folder' },
                        'sep1': '-------',
                        'delete': { name: 'Delete' },
                        'rename': { name: 'Rename' }
                    });
                _.extend(opts.items, {
                    'refresh': { name: 'Refresh' }
                })
                return opts;
            },
            _onExternalRenamed: function (path, newName)
            {
                var node = this.tree.getNodeByKey(path);
                if (node)
                {
                    node.setTitle(newName);
                    var directory = this._fileSystemManager.directory(path);
                    node.data.key = directory + '/' + newName;
                }

            },
            _onExternalDeleted: function (path)
            {
                var node = this.tree.getNodeByKey(path);
                if (node)
                    node.remove();
            },
            _onExternalAdded: function (itemInfo)
            {
                var node = this.tree.getNodeByKey(itemInfo.path);
                var newNode;
                if (node && _.isArray(node.getChildren()))
                    newNode = node.addChild({ key: itemInfo.path + '/' + itemInfo.name, title: itemInfo.name, isFolder: itemInfo.type == 'dir', isLazy: true });

                if (this._inNewFolder && newNode) // New folder added by this instance, enter edit mode
                {
                    this._inNewFolder = false;
                    this.renameNode(newNode);
                }

            },
            newFolder: function(parentNode)
            {
                this._inNewFolder = true;
                this._fileSystemManager.newFolder(parentNode.data.key, function(err, response)
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
            },
            deleteNode: function (node, callback)
            {
                var self = this;

                if (this.options.deleteConfirm)
                {
                    var modalHelper = new ModalHelper();
                    modalHelper.confirm({
                        title: 'Delete item', text: 'Are you sure you want to permanently delete this item?',
                        subtext: node.data.key,
                        width: 400,
                        onButton: function (text)
                        {
                            if (text == 'Yes')
                                doDelete();
                            else
                                callback && callback(false);
                        }
                    });
                }
                else
                    doDelete();

                function doDelete()
                {
                    self.options.deleteHandler(node.data.key, function (err, response)
                    {
                        // TODO: App. helper for error handling/messages
                        var errorText;
                        if (err)
                            errorText = T.t(err);
                        else
                        {
                            if (!response.success)
                                errorText = response.messages.join('<br/>');
                        }
                        if (errorText)
                        {
                            var modalHelper = new ModalHelper();
                            modalHelper.alert({ title: 'Delete item', text: response.messages.join(',') });
                        }
                        else
                        {
                            node.getParent().activate();
                            node.remove();
                            self.customTrigger('node', 'deleted', self.tree, node);
                        }
                        callback && callback(!!errorText);
                    });

                }
            },
            renameNode: function (node, initialTitle)
            {
                var self = this;
                var currentTitle = node.data.title;
                // Let context menu hide
                setTimeout(function ()
                {
                    self.tree.renameNode(node, function (newTitle, callback)
                    {
                        if (newTitle != currentTitle)
                        {
                            self.renameItem(node, newTitle, function (err, response)
                            {
                                callback(((err || !response.success) && currentTitle) || response.newname);
                            });
                        }
                        else
                            callback(currentTitle);

                    });
                }, 0);


            },
            renameItem: function (node, newName, callback)
            {
                var self = this;
                this.options.renameHandler(node.data.key, newName, function (err, response)
                {
                    if (response)
                    {
                        if (response.success)
                        {
                            node.data.key = _.toUnixPath(response.newpath);
                            node.setTitle(response.newname);
                            node.getParent().sortChildren(null, false);
                            self.customTrigger('node', 'renamed', self.tree, node);
                            return callback(null, response);
                        }

                        var modalHelper = new ModalHelper();
                        if (response.suggestion) // newTitle already exists
                        {
                            ModalHelper.GlobalDisableHide = false;
                            modalHelper.confirm({
                                title: 'Rename item', text: 'Do you want to rename<br/>"' + node.data.title + '" to "' + response.suggestion + '"?',
                                subtext: 'There is already an item with the same name in this location',
                                onButton: function (text)
                                {
                                    if (text == 'Yes')
                                        self.renameItem(node, response.suggestion, callback);
                                    else
                                        callback(response.messages, response)
                                }
                            });
                        }
                        else
                        {
                            ModalHelper.GlobalDisableHide = false;
                            modalHelper.alert({ title: 'Rename item', text: response.messages.join(',') });
                            callback(response.messages, response);
                        }
                    }
                    else
                    {
                        // Some error
                        callback(err, response);
                    }
                });

            },
            getSelection: function ()
            {
                return this.tree.getSelectedNodes();
            },
            activeNode: function ()
            {
                return this.tree.getActiveNode();
            },
            getDirectory: function()
            {
                return this._currentDirectory;
            },
            setDirectory: function (dir, callback)
            {
                if (!dir)
                    return callback && callback();

                this._currentDirectory = dir;
                var paths = progressivePaths(dir);
                var loadedIndex;
                var self = this;
                var node;
                tryLoad();

                function tryLoad()
                {
                    var doingTryLoad = false;
                    if (dir == 'System')
                    {
                        node = self.tree.getRoot().getChildren()[0];
                    }
                    else
                    {
                        for (var i = 0; i < paths.length; i++)
                        {
                            var path = paths[i];
                            node = self.tree.getNodeByKey(path);
                            if (node)
                            {
                                node.expand();
                                loadedIndex = i;
                                // Still not loaded everything
                                if (i > 0)
                                {
                                    // lazy node not loaded check
                                    if (typeof node.hasChildren() == 'undefined')
                                    {
                                        doingTryLoad = true;
                                        if (node.isLoading())
                                            setTimeout(tryLoad, 1);
                                        else
                                        {
                                            node.reloadChildren(function ()
                                            {
                                                tryLoad();
                                            })
                                        }
                                    }

                                }
                                // Always break as we have the deepest node we can find, and may have already triggered a reloadChildren()
                                break;
                            }
                        }
                    }
                    if (!doingTryLoad && node)
                    {
                        $(node.li).scrollintoview();
                        $(node.li).click();
                    }

                    if (!doingTryLoad && callback)
                        callback(loadedIndex && paths[loadedIndex]);
                }

            },
            getRoot: function ()
            {
                return this.tree.getRoot();
            },
            customTrigger: function (parentType, eVentName)
            {
                var args = Array.prototype.slice.call(arguments, 2);
                this.trigger.apply(this, [parentType, eVentName].concat(args));
                this.trigger.apply(this, [parentType + ':' + eVentName].concat(args));
            },
            syncChildNodes: function (parentNode, newNodes)
            {
                if (!parentNode)
                    parentNode = this.tree.getRoot();

                var r = { added: [], removed: [] };
                var existingNodes = parentNode.getChildren().slice(0);

                // Remove existing no longer wanted
                _.each(existingNodes, function (existingNode)
                {
                    var matchingNodes = _.filter(newNodes, function (newNode)
                    {
                        return newNode.key == existingNode.data.key;
                    })
                    if (!matchingNodes.length)
                    {
                        r.removed.push(existingNode);
                        existingNode.remove();
                    }
                })

                // Add new
                _.each(newNodes, function (newNode)
                {
                    var matchingNodes = _.filter(existingNodes, function (existingNode)
                    {
                        return newNode.key == existingNode.data.key;
                    })
                    if (!matchingNodes.length)
                    {
                        r.added.push(newNode);
                        parentNode.addChild(newNode);
                    }
                })
                return r;

            }
        });
        function progressivePaths(s)
        {
            var parts = _.toUnixPath(s).split('/');
            if (!_.last(parts))
                parts.pop();
            parts[0] += '/';
            var progressivePaths = parts.slice(0, 1);
            _.each(parts.slice(1), function (v, i)
            {
                progressivePaths.push(_.last(progressivePaths) + (i > 0 ? '/' : '') + v);
            });
            return progressivePaths.reverse();
        }


    }
)

