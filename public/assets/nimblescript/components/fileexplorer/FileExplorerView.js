define(['require', 'jquery', 'underscore', 'backbone', 'marionette', 'App', 'logger', 'swig',
    'text!./fileexplorer.html', 'css!./fileexplorer.css', 'jquery.splitter', 'jquery.scrollintoview', 'jquery.txtinput',
    '../folderbrowser/FolderBrowserView','../directorylist/DirectoryListView','../toolbar/ToolbarView'],
    function (require, $, _, Backbone, Marionette, App, Logger, Swig, html, css, $jquerysplitter,$scrollintoview,$jquerytxtinput,
        FolderBrowserView, DirectoryListView, ToolbarView)
    {
        "use strict"

        return Marionette.Layout.extend({
            template: Swig.compile(html),
            constructor: function()
            {
                _.bindAll(this);
                Marionette.Layout.prototype.constructor.apply(this, arguments);
            },
            events: 
                {
                    'resizing *': 'splitterResizing',
                    'txtinput .file-settings input[name=filename]': 'filenameChanged'
                },
            className: 'file-explorer',
            initialize: function()
            {
                this._initFolderBrowser = true;
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
                    folderBrowserRegion: 'div.folderbrowser',
                    directoryListRegion: 'div.directorylist',
                    toolBarRegion: 'div.toolbar-wrapper'
                },

            onRender: function ()
            {

                var self = this;
                this.ui.fileSettings.css('display', this.options.mode == 'saveFile' ? 'block' : 'none');
                this.setFilename(this.options.initialFilename);

                // Init Directory List
                this.directoryListView = new DirectoryListView(_.extend({ autoChangeDirectory: true }, this.options));
                this.directoryListRegion.show(this.directoryListView);
                this.listenTo(this.directoryListView, 'dblclick', function (e)
                {
                    self.trigger.apply(self, ['list:dblclick', e]);
                })
                this.listenTo(this.directoryListView, 'directory-change', function (newDir)
                {
                    self.setDirectory(newDir, 'directorylist');
                })
                this.listenTo(this.directoryListView, 'selection', function (e)
                {

                    if (self.options.mode == 'saveFile' && e.row && e.row.type == 'file')
                        self.setFilename(e.row.name);
                    self.trigger.apply(self, ['list:selection'].concat(Array.prototype.splice.call(arguments, 0)));
                })

                // Init Folder Browser
                this.folderBrowserView = new FolderBrowserView({
                    restricted: false, initialPath: this.options.initialPath, dironly: true,
                    onPostInit: this._onFolderBrowserPostInit, deleteConfirm: this.options.deleteConfirm
                });
                this.folderBrowserRegion.show(this.folderBrowserView);
                this.listenTo(this.folderBrowserView, 'node', function (eVentType)
                {
                    switch (eVentType)
                    {
                        case "activate":
                            var path = arguments[2].data.key;
                            self.setDirectory(path, 'folderbrowser');
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

                this._fileSystemManager = App.request('filesystem:getmanager');
                this.listenTo(this._fileSystemManager, 'renamed', this._onExternalRename);
                this.listenTo(this._fileSystemManager, 'deleted', this._onExternalDelete);

            },
            _onExternalRename: function(originalPath,newName)
            { 
                if (originalPath == this.currentDirectory())
                {
                    var newDirectory = this._fileSystemManager.directory(originalPath) + '/' + newName;
                    this.ui.path.text(newDirectory);
                    // this.setDirectory(newDirectory);
                }
            },
            _onExternalDelete: function(originalPath)
            {
                if (originalPath == this.currentDirectory())
                    this.upDirectory();

            },
            _onFolderBrowserPostInit: function()
            {
                if (this._initFolderBrowser)
                {
                    var root = this.folderBrowserView.getRoot();
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
                        this.setDirectory(this.options.initialPath, 'directorylist');
                    this._initFolderBrowser = false;
                }
                    
            },
            isExistingFilename: function (filename)
            {
                return this.directoryListView.hasFilename(filename);
            },
            getFilename: function ()
            {
                return this.ui.fileName.val();
            },
            setFilename: function(filename)
            {
                this.ui.fileName.val(filename);
            },
            currentDirectory: function()
            {
                return this._currentDirectory;
            },
            setDirectory: function(dir, source)
            {
                this._currentDirectory = dir;
                this.ui.path.text(dir);
                if (source != 'folderbrowser')
                    this.folderBrowserView.setDirectory(dir);
                if (source != 'directorylist')
                    this.directoryListView.setDirectory(dir,false);
            },
            upDirectory: function()
            {
                if (!this.folderBrowserView.activeNode().data.isSystem)
                {
                    var parentNode = this.folderBrowserView.activeNode().getParent();
                    this.setDirectory(parentNode.data.key);
                }
            },
            getDirectory: function()
            {
                return this.directoryListView.currentDirectory();
            },
            getSelection: function()
            {
                return this.directoryListView.getSelection();
            },
            splitterResizing: function(e)
            {
                this.directoryListView.updateColumnSizing();
            },
            init: function (extraOptions)
            {
                var options = _.extend({},
                    {
                        type: "v",
                        outline: false,
                        sizeLeft: 200,
                        minLeft: 200,
                        resizeToWidth: true,
                        dock: "left",
                        dockSpeed: 200,
                        cookie: "ns-file-explorer-splitter"
                    }, extraOptions);
                var splitter = this.$el.find('.splitter-view').splitter(options);

                // Now ready
                App.trigger('xemware.nimblescript.component.fileexplorer:ready');
            },
            filenameChanged: function ()
            {
                this.trigger('filename:changed');
            }
        });

    }
)
