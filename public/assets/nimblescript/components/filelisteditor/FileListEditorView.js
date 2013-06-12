define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'modalhelper', 'text!./filelisteditor.html', 'css!./filelisteditor',
    '../filelist/FileListView', 'async','select2/select2', 'notify'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ModalHelper, fileListEditorHtml, fileListEditorCss, FileListView,
         Async, $select2, Notify )
    {
        "use strict"

        return Marionette.Layout.extend(
            {
                // Marionette functions
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.Layout.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(fileListEditorHtml),
                tagName: 'div',
                className: 'filelist-editor',
                initialize: function (options)
                {
                    this._super(options);
                    this._fileListManager = App.request('filelists:getmanager');
                    this._fileSystemManager = App.request('filesystem:getmanager');
                    this.listenTo(this._fileListManager, 'all', this.onFileListManagerEVent);
                },
                events: {
                    'click button[data-action=add]': function () { this.addFiles() },
                    'click button[data-action=remove]': function () { this.removeFiles() },
                    'click button[data-action=clear]': function () { this.clearList() },
                    'click button[data-action=load]': function () { this.loadList() },
                    'click button[data-action=save]': function () { this.saveList() },
                    'click button[data-action=delete]': function () { this.deleteList() }
                },
                regions: {
                    fileListRegion: '.filelist-outer'
                },
                ui: {
                    fileLists: '.filelists'
                },
                onRender: function ()
                {
                    var self = this;
                    this.fileListView = new FileListView();
                    this.listenTo(this.fileListView, 'all', this.onFileListViewEVent);
                    this.fileListRegion.show(this.fileListView);
                    this.fileListView.updateColumnSizing();
                    this.populateFileLists('');

                    this.trigger('ready');
                    
                },
                /* Custom */
                onFileListViewEVent: function(eVentName)
                {
                },
                onFileListManagerEVent: function(eVentName)
                {
                    switch (eVentName)
                    {
                        case 'list:saved':
                        case 'list:deleted':
                            this.populateFileLists(!_.isUndefined(this._newListName) ? this._newListName : this.ui.fileLists.val());
                            break;
                    }
                },
                populateFileLists: function (initialVal)
                {
                    var self = this;
                    this._fileListManager.search({
                        callback: function (err,fileLists)
                        {
                            var data = [
                                { text: '<New>', id: '' },
                                { text: 'Local', children: [] }];
                            var children = data[1].children;
                            _.each(fileLists, function (item)
                            {
                                children.push({ id: 'local*' + item.name, text: item.name });
                            })
                            self.ui.fileLists.removeClass('select2-offscreen').select2({
                                data: data
                            });
                            self.ui.fileLists.select2("val", [initialVal]);
                            var newVal = self.ui.fileLists.val();
                            if (_.isEmpty(newVal) )
                                self.ui.fileLists.select2("val", ['']);
                            delete self._newListName;
                            self.trigger('lists:updated');

                        }
                    });


                },
                /* List actions */
                addFiles: function ()
                {
                    var self = this;
                    App.execute('components:get', ['xemware.nimblescript.component.folderbrowser'], function (err, Components)
                    {
                        Components[0].showModal({
                            selectionMode: 'multiple',
                            onOK: function (selectedItems)
                            {
                                var newRows = [];
                                var rowCount = self.fileListView.rowCount();
                                var i = 1;
                                _.each(selectedItems, function(node)
                                {
                                    if (!node.data.isFolder && _.isEmpty(self.fileListView.getRows({ fullpath: node.data.key })) )
                                    {
                                        newRows.push(
                                        {
                                            selected: false, filename: node.data.filename, lastmodified: node.data.lastModified,
                                            directory: node.data.directory, fullpath: node.data.key, size: node.data.size,
                                            position: rowCount + i++
                                        });
                                    }
                                })
                                self.fileListView.addRows(newRows);
                                self.trigger('files:added', newRows);
                            }
                        });
                    })
                },
                removeFiles: function ()
                {
                    this.fileListView.removeChecked();
                },
                clearList: function ()
                {
                    this.fileListView.remove();
                },
                loadList: function (path)
                {
                    if (_.isEmpty(path) )
                        path = this.ui.fileLists.val();

                    if (_.isEmpty(path))
                        return;

                    var self = this;
                    var notify = Notify.loading({ icon: false, text: 'Loading...' });
                    this._fileListManager.loadList(path, {
                        callback: function (err, fileList)
                        {
                            notify.remove();
                            if (!err)
                                self.fileListView.setData(fileList);
                            else
                                new ModalHelper().error(err);
                        }
                    });
                },
                deleteList: function (path)
                {
                    if (_.isEmpty(path) )
                        path = this.ui.fileLists.val();

                    if (_.isEmpty(path))
                        return;

                    this._newListName = ''; // <New>
                    this._fileListManager.deleteList(path, {
                        callback: function (err)
                        {
                            if (err)
                                new ModalHelper().error(err);
                        }
                    });
                },
                saveList: function ()
                {
                    var self = this;
                    var sortedItems = _.sortBy(this.fileListView.getData(), 'position');
                    var name = this.ui.fileLists.val();
                    Async.waterfall([
                        function listName(cb)
                        {
                            if (_.isEmpty(name))
                            {
                                var modal = new ModalHelper().prompt({
                                    title: 'Save as...',
                                    text: 'Please enter a valid filename:',
                                    onButton: function (text)
                                    {
                                        if (text == 'OK')
                                        {
                                            var name = modal.find('input.active').val();
                                            var r = /[A-Za-z\-_\s0-9]+/;
                                            if (!name.match(r))
                                            {
                                                new ModalHelper().alert({ title: 'Error...', text: 'Only following characters are supported:<br/> A-Z, a-z, 0-9, _, -, and spaces' });
                                                return false;
                                            }
                                            // TODO: Support repositories
                                            self._newListName = 'local*' + name;
                                            cb(null, self._newListName);
                                            return true;    
                                        }
                                        else
                                        {
                                            cb(true);
                                            return true;
                                        }
                                    }
                                });
                            }
                            else
                                cb(null, name);
                        },
                        function save(listName, cb)
                        {
                            var notify = Notify.loading({ icon: false, text: 'Saving...' });
                            self._fileListManager.saveList(listName, sortedItems,
                                {
                                    callback: function (err, savedAs)
                                    {
                                        notify.remove();
                                        if (err)
                                            new ModalHelper().error({ title: 'Unable to save list...', text: err });
                                        cb(err, listName);
                                    }
                                });
                            
                        }
                    ], function complete(err, listName)
                    {

                    })
                }

            }

        )
    }

)
