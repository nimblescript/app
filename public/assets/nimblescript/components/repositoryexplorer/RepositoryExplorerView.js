define(['require', 'jquery', 'underscore', 'backbone', 'marionette', 'App', 'logger', 'swig',
    'text!./repositoryexplorer.html', 'css!./repositoryexplorer.css', 'jquery.splitter', 'jquery.scrollintoview', 'jquery.txtinput',
    '../repositorybrowser/RepositoryBrowserView', '../repositoryfolderlist/RepositoryFolderListView', '../toolbar/ToolbarView','cookie'],
    function (require, $, _, Backbone, Marionette, App, Logger, Swig, html, css, $jquerysplitter, $scrollintoview, $jquerytxtinput,
        RepositoryBrowserView, RepositoryFolderListView, ToolbarView,Cookie)
    {
        "use strict"

        var LAYOUT_COOKIE_NAME = 'ns-repository-explorer-splitter';

        return Marionette.Layout.extend({
            template: Swig.compile(html),
            constructor: function ()
            {
                _.bindAll(this);
                Marionette.Layout.prototype.constructor.apply(this, arguments);
            },
            events:
                {
                    'resizing *': 'splitterResizing',
                    'txtinput .file-settings input[name=filename]': 'filenameChanged'
                },
            className: 'repository-explorer',
            initialize: function ()
            {
                this._initRepositoryBrowser = true;
            },
            onShow: function ()
            {
                this.init({ anchorToWindow: this.options.anchorToWindow });
            },
            ui: {
                fileSettings: '.file-settings',
                fileName: '.file-settings input[name=filename]',
                path: '.path-section .path'
            },
            regions:
                {
                    repositoryBrowserRegion: 'div.repositorybrowser',
                    repositoryFolderListRegion: 'div.repositoryfolderlist',
                    toolBarRegion: 'div.toolbar-wrapper'
                },

            onRender: function ()
            {

                var self = this;
                this.ui.fileSettings.css('display', this.options.mode == 'save' ? 'block' : 'none');
                this.setFilename(this.options.initialFilename);

                // Init Repository Folder List
                this.repositoryFolderListView = new RepositoryFolderListView(_.extend({ autoChangeDirectory: true, dironly: true }, this.options));
                this.repositoryFolderListRegion.show(this.repositoryFolderListView);
                this.listenTo(this.repositoryFolderListView, 'dblclick', function (e)
                {
                    self.trigger.apply(self, ['list:dblclick', e]);
                })
                this.listenTo(this.repositoryFolderListView, 'directory-change', function (newDir)
                {
                    self.setDirectory(newDir, 'directorylist');
                })
                this.listenTo(this.repositoryFolderListView, 'selection', function (e)
                {

                    if (self.options.mode == 'save' && e.row && e.row.type == 'file')
                        self.setFilename(e.row.name);
                    self.trigger.apply(self, ['list:selection'].concat(Array.prototype.splice.call(arguments, 0)));
                })

                // Init Folder Browser
                this.repositoryBrowserView = new RepositoryBrowserView({
                    restricted: false, initialPath: this.options.initialPath, dironly: true,
                    onPostInit: this._onRepositoryBrowserPostInit
                });
                this.repositoryBrowserRegion.show(this.repositoryBrowserView);
                this.listenTo(this.repositoryBrowserView, 'node', function (eVentType)
                {
                    switch (eVentType)
                    {
                        case "activate":
                            var path = arguments[2].data.key;
                            self.setDirectory(path, 'repositorybrowser');
                    }
                });

                // Init Toolbar
                this.toolbarView = new ToolbarView();
                var upButton = ToolbarView.createItem('button', {
                    imageIcon: 'arrow-up',
                    imagePosition: 'right',
                    label: 'Up'
                });
                this.listenTo(upButton, 'click', function (button, e)
                {
                    self.upDirectory();
                });
                this.toolbarView.addItem(upButton);
                this.toolBarRegion.show(this.toolbarView);

            },
            _onRepositoryBrowserPostInit: function ()
            {
                if (this._initRepositoryBrowser)
                {
                    var root = this.repositoryBrowserView.getRoot();
                    if (!this.options.initialPath && !_.isEmpty(root.getChildren()))
                    {
                        var firstNode = _.find(root.getChildren(), function (node)
                        {
                            return !node.isStatusNode();
                        });
                        if (firstNode)
                            this.setDirectory(firstNode.data.key);
                    }
                    else if (this.options.initialPath)
                        this.setDirectory(this.options.initialPath);
                    this._initRepositoryBrowser = false;
                }

            },
            isExistingFilename: function(filename)
            {
                return this.repositoryFolderListView.hasFilename(filename);
            },
            getFilename: function ()
            {
                return this.ui.fileName.val();
            },
            setFilename: function (filename)
            {
                this.ui.fileName.val(filename);
            },
            setDirectory: function (dir, source)
            {
                this._currentDirectory = dir;
                this.ui.path.text(dir);
                if (source != 'repositorybrowser')
                    this.repositoryBrowserView.setDirectory(dir);
                if (source != 'directorylist')
                    this.repositoryFolderListView.setDirectory(dir, false);
                this.trigger('directory:changed', dir)
            },
            upDirectory: function ()
            {
                if (!this.repositoryBrowserView.activeNode().data.isSystem)
                {
                    var parentNode = this.repositoryBrowserView.activeNode().getParent();
                    this.setDirectory(parentNode.data.key);
                }
            },
            getDirectory: function ()
            {
                return this._currentDirectory;
            },
            getSelection: function ()
            {
                return this.repositoryFolderListView.getSelection();
            },
            splitterResizing: function (e)
            {
                this.repositoryFolderListView.updateColumnSizing();
            },
            init: function (extraOptions)
            {
                
                if (!Cookie.get(LAYOUT_COOKIE_NAME))
                    Cookie.set(LAYOUT_COOKIE_NAME, '200px', { expires: 365 });

                var options = _.extend({},
                    {
                        type: "v",
                        outline: false,
                        sizeLeft: 200,
                        minLeft: 200,
                        resizeToWidth: true,
                        dock: "left",
                        dockSpeed: 200,
                        cookie: LAYOUT_COOKIE_NAME
                    }, extraOptions);
                var splitter = this.$el.find('.splitter-view').splitter(options);

                // Now ready
                App.trigger('xemware.nimblescript.component.repositoryexplorer:ready');
            },
            filenameChanged: function ()
            {
                this.trigger('itemname:changed');
            }
        });

    }
)
