define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './ParameterBase', 'text!./filesystem.html',
    './Validators', 'components/filelist/FileListView', './ParameterViewBase'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ParameterBase, html, Validators, FileListView,ParameterViewBase)
    {
        "use strict"

        var FileSystemView = ParameterViewBase.extend(
        {
            constructor: function ()
            {
                _.bindAll(this);
                Marionette.ItemView.prototype.constructor.apply(this, arguments);
            },
            template: Swig.compile(html),
            className: 'parameter',
            events: {
                'click a[data-action=browse]': 'browse',
                'click a[data-action=remove]': function () { this.remove(false) },
                'click a[data-action=remove-all]': function () { this.remove(true) },
                'click a[data-action=load-file-list]': 'loadFileList'
            },
            ui: {
                fileLists: 'select.file-lists'
            },
            initialize: function ()
            {
                this._fileListManager = App.request('filelists:getmanager');
                this._fileSystemManager = App.request('filesystem:getmanager');
                this.listenTo(this._fileListManager, 'list:saved', this.populateFileLists);
                this.listenTo(this._fileListManager, 'list:deleted', this.populateFileLists);
            },
            onRender: function ()
            {
                var validators = [];
                if (this.model.get('required'))
                    validators.push('required');
                var lengthRange = this.model.get('lengthRange') || [null, null];
                if (lengthRange)
                {
                    validators.push(Validators.createSelectValidator(this.model.get('required'),
                        lengthRange[0], lengthRange[1]));
                }
                var schema = {
                    key: this.model.get('id'), type: this.model.get('selectionMode') == 'single' ? 'Text' : 'Select',
                    validators: validators, options: []
                };
                if (this.model.get('selectionMode') == 'multiple')
                    schema.editorAttrs = { multiple: 'multiple' };
                else
                    schema.editorAttrs = { readonly: 'readonly' };

                var field = this.options.formBuilder.createField({
                    schema: schema,
                    value: this.model.get('initialValue'), $container: this.$el
                });
                this.editorFields = [field];

                if (this.model.get('selectionMode') == 'multiple')
                {
                    var opts = { columnSettings: {}, reordering: false};
                    _.each(['position', 'filename', 'directory', 'lastmodified', 'size'], function (columnKey)
                    {
                        opts.columnSettings[columnKey] = { hidden: true };
                    })
                    _.extend(opts.columnSettings,
                        {
                            fullpath: { width: '470px' },
                            selected: { width: '25px' }
                        });
                    this._fileListView = new FileListView(opts);
                    this.$el.find('span.file-list-view').replaceWith(this._fileListView.render().$el);
                    this.populateFileLists();
                    var self = this;
                    setTimeout(function ()
                    {
                        self._fileListView.updateColumnSizing();
                    }, 1);
                }
                this.setValue(this.model.get('initialValue'));
            },
            onShow: function()
            {
                this._fileListView && this._fileListView.updateColumnSizing();
            },
            reset: function()
            {
                this._super();
                if (this.model.get('selectionMode') == 'multiple' )
                    this.remove(true);
            },
            populateFileLists: function ()
            {
                var $fileListSelect = this.ui.fileLists;
                this._fileListManager.search({
                    callback: function (err, filelists)
                    {
                        var val = $fileListSelect.val();
                        $fileListSelect.empty();
                        _.each(filelists, function (fileList)
                        {
                            $fileListSelect.addSelectOption(fileList.name, fileList.name, fileList.name == val);
                        });
                    }
                });
            },
            browse: function ()
            {
                var self = this;
                if (!this._lastDirectory)
                    this._lastDirectory = this.model.get('selectionMode') == 'multiple' ?
                        _.last(this.getValue()) : this.getValue();

                App.execute('components:get', ['xemware.nimblescript.component.folderbrowser'], function (err, Components)
                {
                    var modal = Components[0].showModal({
                        selectionMode: self.model.get('selectionMode'),
                        dironly: self.model.get('showFiles') !== true, restricted: true,
                        initialPath: self._lastDirectory,
                        title: self.model.get('dialogTitle') || 'Choose...',
                        onOK: function (selectedItems)
                        {
                            var lastSelectedItem = _.last(selectedItems);
                            if (lastSelectedItem)
                                self._lastDirectory = lastSelectedItem.type == 'file' ? self._fileSystemManager.directory(lastSelectedItem.path) : lastSelectedItem.path;
                            return self.addFiles(selectedItems);
                        }
                    });
                });
            },
            addFiles: function (items)
            {
                var self = this;
                if (items.length)
                {
                    if (this.model.get('selectionMode') == 'single')
                    {
                        if (items[0].type == 'file' || ( this.model.get('allowDirectorySelection') && items[0].type == 'dir' ) )
                        {
                            this.editorFields[0].editor.$el.val(items[0].path);
                            return true;
                        }
                    }
                    else
                    {
                        var rows = [], fileIndex = self._fileListView.rowCount();
                        _.each(items, function (item)
                        {
                            if (item.type == 'file' || (this.model.get('allowDirectorySelection') && items[0].type == 'dir'))
                            {
                                var existing = self._fileListView.getRows({ fullpath: item.path });
                                if (_.isEmpty(existing))
                                {
                                    self.editorFields[0].editor.$el.addSelectOption(item.path, item.path, true);
                                    rows.push({
                                        position: fileIndex++, size: 0, filename: null, fullpath: item.path, selected: false,
                                        lastmodified: null, directory: null
                                    });
                                }
                            }
                        });
                        self._fileListView.addRows(rows);
                        return true;
                    }
                }
                return false;

            },
            remove: function (all)
            {
                if (all)
                {
                    this._fileListView.remove();
                    this.editorFields[0].editor.$el.empty();
                }
                else
                {
                    var checkedRows = this._fileListView.getChecked();
                    this._fileListView.removeChecked();
                    var self = this;
                    _.each(checkedRows, function(row)
                    {
                        self.editorFields[0].editor.$el.children('option').filter(function ()
                        {
                            return $(this).prop('value') == row.fullpath;
                        }).remove();
                    })
                }
            },
            loadFileList: function ()
            {
                var self = this;
                var fileListName = this.ui.fileLists.val();
                if (!_.isEmpty(fileListName))
                {
                    this._fileListManager.loadList('local*' + fileListName, {
                        callback: function (err, list)
                        {
                            if (list)
                            {
                                self.remove(true);
                                var fileIndex = self._fileListView.rowCount();
                                var rows = _.map(list, function(item)
                                {
                                    return {
                                        position: fileIndex++, size: 0, filename: null, fullpath: item.fullpath, selected: false,
                                        lastmodified: null, directory: null
                                    }
                                })
                                self._fileListView.addRows(rows);
                                _.each(rows, function (row)
                                {
                                    self.editorFields[0].editor.$el.addSelectOption(row.fullpath, row.fullpath, true);
                                });
                            }
                            
                        }
                    })
                }
            },
            setValue: function (value)
            {
                
                if (this.model.get('selectionMode') == 'multiple')
                {
                    this._fileListView.remove();
                    var rows = [];
                    var self = this;
                    _.each(value, function (itemPath,i)
                    {
                        rows.push({
                            position: i, size: 0, filename: null, fullpath: itemPath, selected: false,
                            lastmodified: null, directory: null
                        });
                        self.editorFields[0].editor.$el.addSelectOption(itemPath, itemPath, true);
                    });
                    self._fileListView.addRows(rows);
                }
                else // single
                {
                    this._super(value);
                }
            }
        });

        var FileSystemParameter = ParameterBase.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    ParameterBase.prototype.constructor.apply(this, arguments);
                },
                settings: ['dialogTitle', 'dialogInstructions', 'selectionMode', 'allowDirectorySelection', 'showFiles', 'lengthRange'],
                settingsLayout: [
                    { type: 'setting', base: 'text', key: 'description', label: 'Description', className: 'input-xxlarge' },
                    { type: 'html', html: '<div style="margin-bottom: 10px;" class="clearfix"></div>' },
                    { type: 'setting', base: 'text', key: 'dialogTitle', label: 'Dialog Title', className: 'input-xxlarge' },
                    { type: 'html', html: '<div style="margin-bottom: 10px;" class="clearfix"></div>' },
                    { type: 'setting', base: 'text', key: 'dialogInstructions', label: 'Dialog Instructions', className: 'input-xxlarge' },
                    { type: 'html', html: '<div style="margin-bottom: 10px;" class="clearfix"></div>' },
                    { type: 'setting', base: 'checkbox', key: 'selectionMode', label: 'Multiple Selection', truevalue: 'multiple', falsevalue: 'single' },
                    { type: 'setting', base: 'checkbox', key: 'allowDirectorySelection', label: 'Allow Directory Selection' },
                    { type: 'setting', base: 'checkbox', key: 'showFiles', label: 'Show Files' },
                    { type: 'html', html: '<div style="margin-bottom: 10px;" class="clearfix"></div>' },
                    {
                        type: 'setting', base: 'range', key: 'lengthRange', className: 'input-small', min: { label: 'Min', minvalue: 0, allownull: true },
                        max: { label: 'Max', allownull: true, minvalue: 0 }, integeronly: true, fieldset: true, fieldsetlabel: '# of items'
                    }
                ],
                parameterView: FileSystemView
            });

        return FileSystemParameter;

    }
)
