define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', '../datatable/DataTableView', 'moment',
    'jquery.contextmenu'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, DataTableView, moment, $contextmenu)
    {
        "use strict"
        var fileSystemManager = App.request('filesystem:getmanager');

        return Marionette.Layout.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.Layout.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile('<div class="datatable"></div>'),
                tagName: 'div',
                className: 'filelist',
                initialize: function (options)
                {
                    this.options = _.defaults(options, { multipleSelection: false, columnSettings: { fullpath: { hidden: true } } });
                    this._fileSystemManager = App.request('filesystem:getmanager');
                },
                onRender: function ()
                {
                    var opts = _.defaults({}, this.options, {
                        reordering: true, reorderingHelper: this.reorderingHelper, dynamicHeight: true,
                        columns: createColumns(this.options), dynamicColumns: true
                    })
                    this.dataTableView = new DataTableView(opts);
                    this.itemsBody.show(this.dataTableView);
                    this.bindContextMenu();
                    this.listenTo(this,'action', this.onAction)
                },
                events: {
                    'change th input[type=checkbox]': 'onToggleAll',
                    'change tbody tr input[type=checkbox]': 'onToggleItem'
                },
                regions: {
                    itemsBody: 'div'
                },
                ui: {
                    toggleSelecton: 'th input[type=checkbox]'
                },
                onShow: function ()
                {
                    var self = this;
                    setTimeout(function ()
                    {
                        self.updateColumnSizing();
                    }, 0);
                },
                updateColumnSizing: function ()
                {
                    this.dataTableView.updateColumnSizing();
                },
                onToggleAll: function (e)
                {
                    var checked = $(e.currentTarget).prop('checked');
                    this.setSelected(checked);
                },
                onToggleItem: function(e)
                {
                    var checked = $(e.currentTarget).prop('checked');
                    this.setSelected(checked, $(e.currentTarget).parents('tr')[0]);
                },
                setSelected: function(selected, tr)
                {
                    var self = this;
                    var $tr = tr ? $(tr) : this.itemsBody.$el.find('tbody tr');
                    $tr.each(function()
                    {
                        if (! $(this).find('.dataTables_empty').length )
                        {
                            self.dataTableView.updateRowData(selected, this, 1, false, false);
                            $(this).find('input[type=checkbox]').prop('checked', selected);
                        }
                    });
                },
                setData: function(fileList)
                {
                    var coll = new Backbone.Collection();
                    _.each(fileList, function (item,i)
                    {
                        coll.add({
                            position: i+1, size: item.size, filename: item.filename, fullpath: item.fullpath, selected: item.selected,
                            lastmodified: item.lastModified, directory: item.directory
                        });
                    })
                    this.dataTableView.setData(coll);

                },
                getData: function()
                {
                    return this.dataTableView.getData();
                },
                getChecked: function()
                {
                    return this.dataTableView.getRowsData(this.$el.find('tbody tr input[type=checkbox]:checked').map(function ()
                    {
                        return $(this).parents('tr')[0];
                    }));
                },
                rowCount: function()
                {
                    return this.getData().length;
                },
                addRows: function(rows)
                {
                    this.dataTableView.addRows(rows);
                },
                getRows: function(where)
                {
                    var items;
                    if (_.isArray(where))
                    {
                        items = where;

                    }
                    else if (_.isObject(where))
                    {
                        items = _.filter(this.dataTableView.getRowsData(this.$el.find('tbody tr')), where);
                    }
                    else if (!where)
                    {
                        items = this.dataTableView.getRowsData(this.$el.find('tbody tr'));
                    }
                    return items;
                },
                remove: function(where)
                {
                    var self = this;
                    var items = this.getRows(where);
                    _.each(items, function (item)
                    {
                        self.dataTableView.deleteRow(item._tr, null, false);
                    });
                    this.dataTableView.redraw(true);

                    // Update position
                    var sortedRows = _.sortBy(this.getRows(), function (row)
                    {
                        return row.position;
                    });
                    _.each(sortedRows, function (row,i)
                    {
                        // Dirty test for 'No data available...' row
                        if (!_.isUndefined(row.position) )
                            self.dataTableView.updateRowData(i + 1, row._tr, 0, false, false);
                    })
                    this.dataTableView.redraw(true);

                },
                removeChecked: function()
                {
                    var checkedItems = this.getChecked();
                    this.remove(checkedItems);
                },
                onAction: function(data)
                {
                    switch (data.action)
                    {
                        case 'launch':
                            this._fileSystemManager.launch(data.item.fullpath);
                            break;
                        case 'opendir':
                            this._fileSystemManager.launch(this._fileSystemManager.directory(data.item.fullpath));
                            break;
                            
                    }

                },

                bindContextMenu: function ()
                {
                    var self = this;
                    this.itemsBody.$el.contextMenu({
                        selector: '.dataTables_scrollBody tr:not(:has(> td.dataTables_empty))',
                        animation: { duration: 0 },
                        events: {
                            show: function (options)
                            {
                                // $.ui.dynatree.getNode(this).activate();
                            }
                        },
                        build: function ($trigger, e)
                        {
                            self.dataTableView.selectRows($trigger, true, true);
                            var data = self.dataTableView.getRowData(e.currentTarget);
                            var opts = {
                                callback: function (key, options)
                                {
                                    self.trigger('action', { item: data, action: key });
                                },
                                reposition: true
                            };

                            opts.items = {
                                "launch": { name: "Launch" },
                                "opendir": { name: "Open Directory" }
                            };
                            return opts;


                        }
                    })
                },
                /* http://api.jqueryui.com/sortable/#option-helper */
                reorderingHelper: function (e, el)
                {
                    var data = this.dataTableView.getRowData(el[0]);
                    console.log(data);
                    return $('<span class="reorder-helper">Moving: ' + data.fullpath + '</div>')[0];
                }
            });

        function createColumns(options)
        {
            var columns = [
            {
                name: "position", // The key of the model attribute
                label: "#", // The name to display in the header
                hidden: _.deepResult(options, 'columnSettings.position.hidden'),
                type: 'numeric',
                sortable: false,
                width: _.deepResult(options, 'columnSettings.position.width' || null)
            },
            {
                name: "selected",
                label: '<input type="checkbox">',
                type: 'string',
                sortable: false,
                hidden: _.deepResult(options, 'columnSettings.selected.hidden'),
                width: _.deepResult(options, 'columnSettings.selected.width' || '20px'),
                className: 'center',
                render: function (data, type, full)
                {
                    switch (type)
                    {
                        case 'display':
                            return '<input type="checkbox" ' + (full.selected ? 'checked="checked"' : '') + '>';
                        default:
                            return data;
                    }
                }
            },
            {
                name: "filename",
                label: "Filename",
                type: 'string',
                width: _.deepResult(options, 'columnSettings.filename.width' || '25%'),
                hidden: _.deepResult(options, 'columnSettings.filename.hidden'),
                sortable: false,
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
                sortable: false,
                width: _.deepResult(options, 'columnSettings.lastmodified.width' || '15%'),
                hidden: _.deepResult(options, 'columnSettings.lastmodified.hidden'),
                render: function (data, type, full)
                {
                    switch (type)
                    {
                        case 'sort':
                            return data;
                        case 'display':
                            var formattedData = data ? moment(data).format('M/D/YYYY h:mm:ss a') : '';
                            return '<span class="text">' + formattedData + '</span>';
                        default:
                            return data;
                    }
                }
            },
            {
                name: "size",
                label: "Size",
                type: 'numeric',
                width: _.deepResult(options, 'columnSettings.size.width' || '10%'),
                hidden: _.deepResult(options, 'columnSettings.size.hidden'),
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
            },
            {
                name: "directory",
                label: "Directory",
                type: 'string',
                sortable: false,
                width: _.deepResult(options, 'columnSettings.directory.width' || '40%'),
                hidden: _.deepResult(options, 'columnSettings.directory.hidden')

            },
            {
                name: "fullpath",
                label: "Full Path",
                type: 'string',
                width: _.deepResult(options, 'columnSettings.fullpath.width' || '90%'),
                sortable: false,
                hidden: _.deepResult(options, 'columnSettings.fullpath.hidden')

            }];

            return columns;

        };

    }
)
