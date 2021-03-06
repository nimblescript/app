﻿define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', '../datatable/DataTableView', 'moment',
    'jquery.contextmenu', 'modalhelper', 'translate'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, DataTableView, moment, $contextmenu, ModalHelper,T)
    {
        "use strict"
        var fileSystemManager = App.request('filesystem:getmanager');

        return Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(''),
                tagName: 'div',
                initialize: function (options)
                {
                    this.options = _.extend({}, {
                        multipleSelection: false,
                        onContextMenu: this._onContextMenu
                    }, options);
                    this._currentDirectory = null;
                },
                onRender: function ()
                {
                    var opts = _.extend({}, this.options, { dynamicHeight: true, columns: createColumns(), noRecordsText: T.t('components.repositoryfolderlist.no_records') })
                    this.dataTableView = new DataTableView(opts);
                    this.$el.append(this.dataTableView.render().$el);
                    this.listenToEvents();
                },
                onDomRefresh: function ()
                {
                    this.updateColumnSizing();
                    this.setDirectory(this.options.initialPath, false);
                    this.dataTableView.sort([[1, 'asc']]);

                },
                listenToEvents: function ()
                {
                    var self = this;
                    this.listenTo(this.dataTableView, 'row', function (eVentName)
                    {
                        switch (eVentName)
                        {
                            case "dblclick":
                                self.trigger('dblclick', _.toArray(arguments).slice(1));
                                var r = arguments[1].type;
                                if (r == 'dir')
                                {
                                    if (self.options.autoChangeDirectory)
                                        self.setDirectory(arguments[1].key);
                                }
                                break;
                            case "selection":
                                self.trigger.apply(self, _.toArray(arguments));
                                break;
                        }
                    });

                    this._repositoryManager = App.request('repository:getmanager');
                    this.listenTo(this._repositoryManager, 'item:renamed', this._onExternalRenamed);
                    this.listenTo(this._repositoryManager, 'item:deleted', this._onExternalDeleted);
                    this.listenTo(this._repositoryManager, 'item:added', this._onExternalAdded);
                },
                // RepositoryManager eVent handler
                _onExternalRenamed: function (path, newName)
                {
                    if (this._currentDirectory == path)
                    {
                        this._currentDirectory = this._repositoryManager.directory(path) + '/' + newName;
                    }
                    else
                    {
                        var directory = this._repositoryManager.directory(path);
                        var item = _.find(this.dataTableView.getRowsData(), { key: path });
                        if (item)
                        {
                            _.extend(item,{ key: directory + '/' + newName, name: newName });
                            this.dataTableView.updateRowData(item, item._tr,undefined, false, true);
                        }
                    }


                },
                // RepositoryManager eVent handler
                _onExternalDeleted: function (path)
                {
                    var item = _.find(this.dataTableView.getRowsData(), { key: path });
                    if (item)
                        this.dataTableView.deleteRow(item._tr);
                },
                // RepositoryManager eVent handler
                _onExternalAdded: function (itemInfo)
                {
                    if (itemInfo.path == this.currentDirectory())
                    {
                        this.dataTableView.addRows([ {
                            key: itemInfo.path + '/' + itemInfo.name, name: itemInfo.name, size: parseInt(itemInfo.size, 10), type: itemInfo.type == 'folder' ? 'dir' : 'file',
                            lastmodified: itemInfo.lastmodified
                        }], true);

                        if (this._inNewFolder)
                        {
                            this._inNewFolder = false;
                            var item = _.find(this.dataTableView.getRowsData(), { key: itemInfo.path + '/' + itemInfo.name });
                            this.renameRow(item);
                        }

                    }

                },
                deleteItem: function (path, callback)
                {
                    var self = this;

                    if (this.options.deleteConfirm)
                    {
                        var modalHelper = new ModalHelper();
                        modalHelper.confirm({
                            title: 'Delete item', text: 'Are you sure you want to permanently delete this item?',
                            subtext: path,
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
                        self._repositoryManager.deleteItem(path, function (err, response)
                        {
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
                                modalHelper.alert({ title: 'Delete item', text: response.messages.join(',') });
                            }
                            else
                            {
                                // Do nothing as handled in _onDelete
                            }
                            callback && callback(!!errorText);
                        });

                    }
                },
                newFolder: function ()
                {
                    this._inNewFolder = true;
                    this._repositoryManager.newFolder(this.currentDirectory(), function (err, response)
                    {
                        if (err || !response.success)
                        {
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
                renameRow: function (row, initialTitle)
                {
                    var self = this;
                    var currentName = row.name;
                    // Let context menu hide
                    setTimeout(function ()
                    {
                        self.dataTableView.editColumn(row._tr, 'name', function (value, callback)
                        {
                            if (value != currentName)
                            {
                                self.renameItem(row, value, function (err, response)
                                {
                                    callback(((err || !response.success) && currentName) || response.newname);
                                });
                            }
                            else
                                callback(currentName);

                        })
                    }, 0);


                },
                renameItem: function (row, newName, callback)
                {
                    var self = this;
                    this._repositoryManager.renameItem(row.key, newName, function (err, response)
                    {
                        if (response)
                        {
                            if (response.success)
                            {
                                self.dataTableView.updateRowData(response.newpath, row._tr, 0, false, true);
                                // self.customTrigger('node', 'renamed', self.tree, node);
                                return callback && callback(null, response);
                            }

                            var modalHelper = new ModalHelper();
                            if (response.suggestion) // newTitle already exists
                            {
                                ModalHelper.GlobalDisableHide = false;
                                modalHelper.confirm({
                                    title: 'Rename item', text: 'Do you want to rename<br/>"' + row.name + '" to "' + response.suggestion + '"?',
                                    subtext: 'There is already an item with the same name in this location',
                                    onButton: function (text)
                                    {
                                        if (text == 'Yes')
                                            self.renameItem(row, response.suggestion, callback);
                                        else
                                            callback && callback(response.messages, response)
                                    }
                                });
                            }
                            else
                            {
                                ModalHelper.GlobalDisableHide = false;
                                modalHelper.alert({ title: 'Rename item', text: response.messages.join(',') });
                                callback && callback(response.messages, response);
                            }
                        }
                        else
                        {
                            // Some error
                            callback(err, response);
                        }
                    });

                },
                _onContextMenu: function (row, e)
                {
                    var self = this;
                    var opts = {
                        callback: function (key, options)
                        {
                            switch (key)
                            {
                                case 'rename':
                                    self.renameRow(row);
                                    break;
                                case 'delete':
                                    self.deleteItem(row.key);
                                    break;
                                case 'newfolder':
                                    self.newFolder();
                                    break;
                            }
                        },
                        items: {}
                    };

                    // TODO: Support permissions for server based repository stores
                    var permissions = [];

                    // Common operations
                    if (!row.root)
                    {
                        _.extend(opts.items,
                            {
                                'delete': { name: 'Delete' },
                                'rename': { name: 'Rename' }
                            }
                        );
                    }
                    _.extend(opts.items,
                        {
                            'newfolder': { name: 'New Folder' }
                        }
                        )

                    if (_.isEmpty(opts.items))
                    {
                        _.extend(opts.items, {
                            'none': { name: 'No actions', disabled: true }
                        })
                    }

                    return opts;
                },
                hasFilename: function(filename)
                {
                    return !_.isEmpty(_.filter(this.dataTableView.getData(), { name: filename }));
                },
                currentDirectory: function ()
                {
                    return this._currentDirectory;
                },
                setDirectory: function (path, triggerEVent, callback)
                {
                    if (_.isFunction(triggerEVent))
                        callback = triggerEVent;
                    if (!_.isBoolean(triggerEVent))
                        triggerEVent = true;

                    var self = this;
                    if (path == 'System')
                    {
                        this._repositoryManager.getRepositories(true, function (err, repositories)
                        {
                            var data = [];
                            _.each(repositories, function (repositoryInfo)
                            {
                                data.push({ root: true, name: repositoryInfo.title, type: 'dir', key: repositoryInfo.id + '*' + repositoryInfo.path, size: 0, lastmodified: null });
                            })
                            setData(data);
                        });
                    }
                    else if (_.isString(path))
                    {
                        this._repositoryManager.getFolderItems(path, function (err, items)
                        {
                            var data = [];
                            _.each(items, function (item)
                            {
                                data.push({
                                    name: item.title, type: item.isFolder ? 'dir' : 'file',
                                    key: item.key, size: item.size, lastmodified: item.lastModified
                                });
                            })
                            setData(data);

                        });
                    }
                    else
                        setData([]);
                
                    function setData(data)
                    {
                        var coll = new Backbone.Collection(data);
                        self.dataTableView.setData(coll, true);
                        self._currentDirectory = path;
                        if (triggerEVent)
                            self.trigger('directory-change', path);
                        callback && callback();
                    }

                },
                getSelection: function ()
                {
                    return this.dataTableView.getSelection();
                },
                updateColumnSizing: function ()
                {
                    this.dataTableView.updateColumnSizing();
                }
            });




        function createColumns()
        {
            var self = this;
            var columns = [{
                name: "key", // The key of the model attribute
                label: "key", // The name to display in the header
                hidden: true
            }, {
                name: "name",
                label: "Name",
                type: 'string',
                render: function (data, type, full)
                {
                    switch (type)
                    {
                        case 'sort':
                            return full.type == 'dir' ? '&&' + data : data;
                        case 'display':
                            return '<span class="icon ' + full.type + '"></span><span class="text">' + data + '</span>';
                        default:
                            return data;
                    }
                }

            },
            {
                name: "lastmodified",
                label: "Modified",
                type: 'date',
                width: '170px',
                render: function (data, type, full)
                {
                    switch (type)
                    {
                        case 'display':
                            var formattedData = data ? moment(data).format('M/D/YYYY h:mm:ss a') : '';
                            return '<span class="text">' + formattedData + '</span>'
                        default:
                            return data;
                    }
                }
            },
            {
                name: "size",
                label: "Size",
                type: 'numeric',
                width: '100px',
                render: function (data, type, full)
                {
                    switch (type)
                    {
                        case 'display':
                            return full.type == 'dir' ? '' : fileSystemManager.formatSize(data);
                        default:
                            return data;
                    }
                }
            }];

            return columns;

        }


    }
)
