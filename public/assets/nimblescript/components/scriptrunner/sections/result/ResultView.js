define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./result.html','components/filelist/FileListView','async','modalhelper'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, html,FileListView,Async,ModalHelper)
    {
        "use strict"

        return Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                events: {
                    'click a[data-action="save-file-list"]': 'saveFileList',
                    'change select.file-lists': 'displayFileList'
                },
                ui: {
                    'fileLists': 'select.file-lists', 
                    'output': '.output'
                },
                template: Swig.compile(html),
                tagName: 'div',
                initialize: function()
                {
                    this._fileListManager = App.request('filelists:getmanager');
                    this.listenTo(this.model, 'change:result', this.onResult);
                },
                render: function()
                {
                    this._super();
                    var opts = { columnSettings: {}, reordering: false};
                    _.each(['selected','position', 'filename', 'directory', 'lastmodified', 'size'], function (columnKey)
                    {
                        opts.columnSettings[columnKey] = { hidden: true };
                    })
                    opts.columnSettings['fullpath'] = { width: '580px' };

                    this._fileListView = new FileListView(opts);
                    this.$el.find('div.filelist').replaceWith(this._fileListView.render().$el);
                    var self = this;
                    setTimeout(function ()
                    {
                        self._fileListView.updateColumnSizing();
                    }, 1);
                    return this;
                },
                onShow: function()
                {
                    this._fileListView.updateColumnSizing();
                },
                onResult: function ()
                {
                    var result = this.model.get('result') || {};
                    this.ui.output.val(result.output);
                    this.populateFileLists(result.filelists);
                },
                populateFileLists: function(fileLists)
                {
                    var self = this;
                    this.ui.fileLists.empty();
                    _.each(fileLists, function (fileList)
                    {
                        self.ui.fileLists.addSelectOption(fileList.name, fileList.name, false, { filelist: fileList } )
                    });
                    // Display first list
                    this.displayFileList();
                },
                selectedFileList: function()
                {
                    return this.ui.fileLists.children('option:selected').data('filelist');
                },
                saveFileList: function ()
                {
                    var fileList = this.selectedFileList();
                    if (fileList)
                    {
                        var sortedItems = _.sortBy(this._fileListView.getData(), 'position');
                        var name = fileList.name;
                        var self = this;
                        Async.waterfall([
                            function listName(cb)
                            {
                                var modal = new ModalHelper().prompt({
                                    title: 'Save as...',
                                    text: 'Please enter a valid filename:',
                                    value: name,
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
                                            name = 'local*' + name;
                                            cb(null, name);
                                            return true;
                                        }
                                        else
                                        {
                                            cb(true);
                                            return true;
                                        }
                                    }
                                });
                            },
                            function save(listName, cb)
                            {
                                self._fileListManager.saveList(listName, sortedItems,
                                    {
                                        callback: function (err, savedAs)
                                        {
                                            if (err)
                                                new ModalHelper().alert({ title: 'Unable to save list...', text: err });
                                            cb(err, listName);
                                        }
                                    });

                            }
                        ], function complete(err, listName)
                        {

                        })

                    }
                },
                displayFileList: function ()
                {
                    this._fileListView.remove();
                    var fileList = this.selectedFileList();
                    if (fileList)
                    {
                        var fileIndex =  1;
                        var rows = _.map(fileList.files, function(filePath)
                        {
                            return {
                                position: fileIndex++, size: 0, filename: null, fullpath: filePath, selected: false,
                                lastmodified: null, directory: null
                            };
                        });
                        this._fileListView.addRows(rows);
                        
                    }
                }
            });
    }
)
