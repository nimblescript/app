define(['require', 'backbone', 'marionette', 'jquery','App', 'swig', 'logger', 'jquery.datatables',
    'css!/assets/css/smoothness/datatable','jquery.datatables.rowReordering', 'modalhelper', 'translate'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, $Datatables, cssDataTable, $DatatablesReordering, ModalHelper,T)
    {
        "use strict"

        return Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile('<table class="display" style="width: 100%"></table>'),
                tagName: 'div',
                initialize: function (options)
                {
                    this.options = _.defaults(options, { multipleSelection: false, showHeader: true, dynamicColumns: true, onContextMenu: null });
                    this._columnSizing = false;
                    this._$currentEditInput = null;
                },
                events:
                    {
                        'click tbody tr': 'rowClick',
                        'dblclick tbody tr': 'rowDblClick'
                        // 'contextmenu thead th': 'headerContext',
                        // 'click thead th': 'headerClick' 

                    },
                ui:{
                    tbody: 'tbody'
                },
                onRender: function ()
                {
                    var self = this;
                    var opts = {
                        "bJQueryUI": true,
                        "bPaginate": false,
                        "sWidth": "100%",
                        "bFilter": false,
                        "bInfo": false,
                        "oLanguage": 
                            {
                                sEmptyTable: this.options.noRecordsText || T.t('components.datatable.no_records')
                            },
                        "sDom": 't',
                        "aoColumns": _.map(this.options.columns, function (col)
                        {
                            _.defaults(col, { sortable: true });
                            return {
                                sTitle: col.label, mData: col.customData || col.name,
                                bVisible: !col.hidden, mRender: col.render,
                                sType: col.type, sWidth: col.width, bSortable: col.sortable,
                                sClass: col.className, fnCreatedCell: self.onCellCreated
                            };
                        })
                        
                    };
                    if (this.options.dynamicColumns)
                    {
                        _.extend(opts, {
                            "sScrollY": "100%",
                            "sScrollX": "100%"
                            // "sScrollXInner": "100%",
                        });
                    }
                    if (this.options.collection)
                        opts.aaData = this.toData(this.options.collection);

                    this.dataTable = this.$el.find('table').dataTable(opts);
                    if (this.options.reordering)
                        this.dataTable.rowReordering({ helper: this.options.reorderingHelper });
                    this.bindUIElements(); // Re bind
                    this.bindContextMenu();

                    $(window).bind('resize', function ()
                    {
                        self.updateColumnSizing();
                    });

                },
                onCellCreated: function(td, cellData, rowData, rowIndex, columnIndex)
                {
                    var columnKey = this.options.columns[columnIndex].name;
                    $(td).attr('colkey', columnKey).attr('colindex', columnIndex);
                },
                toData: function(collection)
                {
                    return collection.map(function (model)
                    {
                        return model.attributes;

                    });
                },
                setData: function(collection, sort)
                {
                    this.dataTable.fnClearTable();
                    this.dataTable.fnAddData(this.toData(collection));
                    if (!!sort)
                        this.dataTable.fnDraw(true);
                },
                getData: function()
                {
                    return this.dataTable.fnGetData();
                },
                rowDblClick: function(e)
                {
                    var row = this.dataTable.fnGetData(e.currentTarget);
                    row._tr = e.currentTarget;
                    if (this._$currentEditInput)
                        thi._$currentEditInput.blur();
                    this.customTrigger('row', 'dblclick', row);
                },
                rowClick: function(e)
                {
                    
                    var self = this;
                    var row = this.dataTable.fnGetData(e.currentTarget);

                    var $row = $(e.currentTarget);
                    if (this.options.multipleSelection)
                        $row.toggleClass('row_selected');
                    else
                    {
                        if ($row.hasClass('row_selected'))
                        {
                            $row.removeClass('row_selected');
                        }
                        else
                        {
                            self.$el.find('tr.row_selected').removeClass('row_selected');
                            $row.addClass('row_selected');
                        }
                    }

                    this.customTrigger('row', 'click', row, e.currentTarget);
                    this.customTrigger('row', 'selection', { row: $row.hasClass('row_selected') ? row : null, cancel: false  } );
                },
                onDomRefresh: function()
                {
                    this.updateColumnSizing();
                },
                updateColumnSizing: function ()
                {
                    if (this.options.dynamicColumns)
                        this.dataTable.fnAdjustColumnSizing();
                    if (this.options.dynamicHeight)
                    {
                        var $parent = this.$el.parents('div.datatable').first();
                        var $header = $parent.find('.dataTables_scrollHead');
                        var newHeight = $parent.height() - $header.height();
                        this.$el.find('.dataTables_scrollBody').css('height', newHeight + 'px');
                    }
                    
                },
                customTrigger: function (parentType, eVentName)
                {
                    var args = Array.prototype.slice.call(arguments, 2);
                    this.trigger.apply(this, [parentType, eVentName].concat(args));
                    this.trigger.apply(this, [parentType + ':' + eVentName].concat(args));
                },
                getSelection: function ()
                {
                    var $selectedRows = this.$el.find('table tr.row_selected');
                    return this.getRowsData($selectedRows);
                },
                getRowsData: function($rows)
                {
                    if (!$rows)
                        $rows = this.$el.find('tbody tr');

                    var self = this;
                    return _.map($rows.toArray(), function (r)
                    {
                        return self.getRowData(r);
                    });
                },
                getRowPosition: function (el)
                {
                    return this.dataTable.fnGetPosition(el);
                },
                selectRows: function (ref, selected, clearSelection)
                {
                    var $rows = this.findRows(ref);
                    if (clearSelection)
                        this.ui.tbody.find('tr').removeClass('row_selected');
                    if ($rows)
                        $rows.toggleClass('row_selected', selected);
                },

                findRows: function (ref)
                {
                    var $el;
                    if (_.isNumber(ref))
                    {
                        // 0 based position
                        $el = $(this.ui.tbody.find('tr').get(ref));
                    }
                    else if (ref instanceof $)
                    {
                        $el = ref;
                    }
                    else if (_.isObject(ref))
                    {
                        
                    }
                    else if (_.isElement(ref))
                        $el = $(ref);

                    return $el;
                },
                getRowData: function (ref)
                {
                    return _.extend({}, this.dataTable.fnGetData(ref), { _tr: ref });
                },
                updateRowData: function(data, rowRef, colIndex, redraw, preDraw)
                {
                    this.dataTable.fnUpdate(data, rowRef, colIndex, redraw, preDraw);
                },
                deleteRow: function (ref, callback, redraw)
                {
                    this.dataTable.fnDeleteRow(ref, callback, redraw);
                },
                addRows: function(rows, redraw)
                {
                    this.dataTable.fnAddData(rows, redraw);
                },
                redraw: function (reCalc)
                {
                    this.dataTable.fnDraw(reCalc);
                },
                bindContextMenu: function ()
                {
                    if (!this.options.onContextMenu)
                        return;

                    var self = this;

                    this.$el.contextMenu({
                        selector: '.dataTables_wrapper tbody tr:not(.editing)',
                        animation: { duration: 0 },
                        events: {
                            show: function (options)
                            {
                                self.selectRows(this, true, true);
                            }
                        },
                        build: function($row, e)
                        {
                            return self.options.onContextMenu(self.getRowsData($row)[0], e);
                        }
                    });
                },
                sort: function ()
                {
                    this.dataTable.fnSort.apply(this.dataTable, arguments);
                },
                editColumn: function (rowTR, columnRef, callback)
                {
                    // PreVent modal actions closing
                    ModalHelper.GlobalDisableHide = true;
                    var $row = $(rowTR);
                    var columnKey, columnIndex;
                    if (_.isNumber(columnRef))
                    {
                        columnIndex = columnRef;
                        columnKey = this.options.columns[columnRef].name;
                    }
                    else
                    {
                        columnKey = columnRef;
                        _.each(this.options.columns, function(column, i)
                        {
                            if (column.name == columnKey)
                            {
                                columnIndex = i;
                                return false;
                            }
                        })
                    }

                    var $cell = $row.children('td[colkey=' + columnKey + ']');
                    if (!$cell.length)
                        return false;

                    var data = this.getRowData(rowTR);

                    var self = this;
                    var prevValue = data[columnKey];
                    $row.addClass('editing');
                    this._$currentEditInput = $('<input value="' + prevValue + '">').css('z-index', 1000);
                    $cell.children('span.text').empty().append(this._$currentEditInput);
                    // Focus <input> and bind keyboard handler
                    this._$currentEditInput
                      .focus()
                      .keydown(function (e)
                      {
                          switch (e.which)
                          {
                              case 27: // [esc]
                                  self._$currentEditInput.val(prevValue);
                                  $(this).blur();
                                  break;
                              case 13: // [enter]
                                  $(this).blur();
                                  break;
                          }
                      }).blur(function (e)
                      {

                          var newValue = self._$currentEditInput.val();
                          callback(newValue, function (finalValue)
                          {
                              if (_.isString(finalValue))
                              {
                                  ModalHelper.GlobalDisableHide = false;
                                  self.updateRowData(finalValue, rowTR, columnIndex, false, true);
                                  $row.removeClass('editing');
                                  self._$currentEditInput = null;
                              }
                              else
                              {
                                  e.preventDefault();
                                  e.stopImmediatePropagation();
                                  return false;
                              }

                          });
                      });

                }
            });
    }
)
