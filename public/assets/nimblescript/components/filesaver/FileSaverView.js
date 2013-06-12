define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', '../folderbrowser/FolderBrowserView', 'jquery.contextmenu',
    'text!./filesaver.html', 'css!./filesaver.css'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, FolderBrowserView, $contextmenu, html, css)
    {
        "use strict"

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
                className: 'script-browser',
                initialize: function (options)
                {
                    this.options = _.defaults({}, options, { executeNodeActions: true });
                },
                onRender: function ()
                {
                    this.populate();
                },
                listenToEvents: function ()
                {
                    var self = this;
                    // Bubble events
                    this.listenTo(this.folderBrowserView, 'all', function (eVentName)
                    {
                        self.trigger.apply(self, arguments)
                    });
                    this.listenTo(this, 'node:action', this.onNodeAction)
                },
                onNodeAction: function (actionData)
                {
                    if (this.options.executeNodeActions)
                        this.executeNodeAction(actionData);
                },
                executeNodeAction: function (actionData)
                {
                    
                    switch (actionData.action)
                    {
                        case 'edit':
                            var topParent = getTopParent(actionData.node);
                            this.repositoryManager.editScript(actionData.node.data.key);
                            break;
                        case 'newscript':
                            var topParent = getTopParent(actionData.node);
                            this.repositoryManager.newScriptFromTemplate();
                            break;
                    }
                },
                populate: function ()
                {
                    var self = this;
                    this.repositoryManager.getRepositories(true, function (err, repositories)
                    {
                        var repositoryNodes = [];
                        _.each(repositories, function (repositoryInfo)
                        {
                            repositoryNodes.push({ title: repositoryInfo.title, isFolder: true, key: repositoryInfo.path, isLazy: true, storeType: repositoryInfo.storeType, isRoot: true, repositoryId: repositoryInfo.id });
                        })

                        if (!self.folderBrowserView)
                        {
                            var opts = _.extend({}, self.options, {
                                initialNodes: repositoryNodes,
                                onCreate: function (node, span)
                                {
                                    self.bindContextMenu(node, span);
                                },
                                lazyUrl: function (node)
                                {
                                    // Dynamic path for lazy loading of nodes
                                    return {
                                        url: '/repository/item/' + encodeURIComponent(node.data.key) + '/children',
                                        data: { fileFilter: JSON.stringify(['.*\\.ns']) }
                                    }
                                }
                            })
                            self.folderBrowserView = new FolderBrowserView(opts);
                            self.folderBrowser.show(self.folderBrowserView);
                            self.listenToEvents();
                        }
                        else
                        {
                            self.folderBrowserView.syncChildNodes(null, repositoryNodes)
                        }
                    });


                },
                bindContextMenu: function (node, span)
                {
                    var self = this;

                    self.folderBrowser.$el.contextMenu({
                        selector: 'span.dynatree-node',
                        animation: { duration: 0 },
                        events: {
                            show: function (options)
                            {
                                $.ui.dynatree.getNode(this).activate();
                            }
                        },
                        build: function ($trigger, e)
                        {
                            var node = $.ui.dynatree.getNode($trigger);
                            var opts = {
                                callback: function (key, options)
                                {
                                    self.trigger('node:action', { node: node, action: key });
                                }
                            };

                            // TODO: Support permissions for server based repository stores
                            var permissions = node.data.permissions;

                            if (node.data.isFolder)
                            {
                                opts.items = {
                                    "newscript": { name: "New Script" },
                                    "newfolder": { name: "New Folder" }
                                };
                                if (!node.data.isRoot)
                                {
                                    _.extend(opts.items, {
                                        "sep1": "-------",
                                        "rename": { name: "Rename" },
                                        "paste": { name: "Paste" },
                                        "delete": { name: "Delete" },
                                    })
                                }
                            }
                            else
                            {
                                opts.items = {
                                    "open": { name: "Open" },
                                    "run": { name: "Run" },
                                    "edit": { name: "Edit" },
                                    "sep1": "-------",
                                    "copy": { name: "Copy" },
                                    "paste": { name: "Paste" },
                                    "delete": { name: "Delete" },
                                    "rename": { name: "Rename" }
                                }
                            }
                            return opts;


                        }
                    })
                },
                activeNode: function ()
                {
                    return this.folderBrowserView.activeNode()
                },
                setDirectory: function (path)
                {
                    this.folderBrowserView.setDirectory(path);
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
