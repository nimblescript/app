define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'dynatree', 'modalhelper'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, $dynatree, ModalHelper)
    {
        "use strict"
        return Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(''),
                tagName: 'div',
                className: 'tree',
                initialize: function (options)
                {
                    this.options = _.defaults({}, options, {
                        expandOnDblClick: true,
                        onContextMenu: null,
                        allowRename: true,
                        selectionMode: 'single',
                        initialAjaxUrl: null,
                        initialAjaxData: null,
                        lazyUrl: null,
                        onPostInit: null,
                        postLazyRead: null,
                        dnd: {
                            callback: null,
                            autoExpand: 500,
                            preventVoidMoves: true
                        }
                    });
                },
                onRender: function ()
                {
                    this.initTree();
                },
                initTree: function ()
                {
                    var viewSelf = this;
                    var opts = {
                        // autoFocus: true,
                        selectMode: this.options.selectionMode == 'single' ? 1 : 2,
                        checkbox: this.options.selectionMode == 'multiple',
                        clickFolderMode: 1,
                        debugLevel: 0,
                        onPostInit: function ()
                        {
                            if (!viewSelf.tree)
                            {
                                viewSelf.tree = viewSelf.$el.dynatree('getTree');
                                viewSelf.tree.selectChildrenOnLazyRead = false;

                            }
                            _.isFunction(viewSelf.options.onPostInit) && viewSelf.options.onPostInit();

                        },
                        onLazyRead: function (node)
                        {
                            viewSelf.customTrigger('node', 'lazyread', viewSelf.tree, node);
                            var self = this;
                            var lazyUrl = _.isFunction(viewSelf.options.lazyUrl) ? viewSelf.options.lazyUrl(node) : _.result(viewSelf.options, 'lazyUrl');
                            var url;
                            if (_.isString(lazyUrl))
                                url = lazyUrl;
                            else
                                url = lazyUrl.url;
                            var data = {};
                            var extraData = _.result(lazyUrl, 'data');
                            _.extend(data, extraData);
                            node.appendAjax({
                                url: url,
                                data: data,
                                postProcess: function (data, dataType)
                                {
                                    return data.success && data.items;
                                },
                                success: function (node)
                                {
                                    viewSelf.options.postLazyRead && viewSelf.options.postLazyRead(node);
                                },
                                error: function (xhr, statusText, exception)
                                {
                                    viewSelf.options.postLazyRead && viewSelf.options.postLazyRead(arguments);
                                }

                            });
                        },
                        onActivate: function (node)
                        {
                            viewSelf.customTrigger('node', 'activate', viewSelf.tree, node);
                        },
                        onExpand: function (expanded, node)
                        {
                            viewSelf.customTrigger('node', 'expand', viewSelf.tree, node, expanded);
                        },
                        onFocus: function (node)
                        {
                            viewSelf.customTrigger('node', 'focus', viewSelf.tree, node);
                        },
                        onBlur: function (node)
                        {
                            viewSelf.customTrigger('node', 'blur', viewSelf.tree, node);
                        },
                        onClick: function (node, event)
                        {
                            viewSelf.customTrigger('node', 'click', viewSelf.tree, node, event);
                        },
                        onSelect: function (selected, node)
                        {
                            viewSelf.customTrigger('node', 'select', viewSelf.tree, node, selected);
                        },
                        onDblClick: function (node, event)
                        {
                            viewSelf.customTrigger('node', 'dblclick', viewSelf.tree, node, event);
                            if (viewSelf.options.expandOnDblClick)
                                if (node.data.isFolder)
                                    node.toggleExpand();
                        },
                        dnd: {
                            autoExpandMS: viewSelf.options.dnd.autoExpand,
                            preventVoidModes: viewSelf.options.dnd.preventVoidModes,
                            onDragStart: function (dragNode)
                            {
                                return viewSelf.options.dnd.callback ? viewSelf.options.dnd.callback({ event: 'dragstart', dragNode: dragNode }) : false;
                            },
                            onDragStop: function (dragNode)
                            {
                                return viewSelf.options.dnd.callback && viewSelf.options.dnd.callback({ event: 'dragstop', dragNode: dragNode } );
                            },
                            onDragEnter: function (dragNode, targetNode)
                            {
                                return viewSelf.options.dnd.callback ? viewSelf.options.dnd.callback({ event: 'dragenter', dragNode: dragNode, targetNode: targetNode }) : false;
                            },
                            onDragOver: function (dragNode, targetNode, hitMode)
                            {
                                return viewSelf.options.dnd.callback ? viewSelf.options.dnd.callback({
                                    event: 'dragover',
                                    dragNode: dragNode, targetNode: targetNode,
                                    hitMode: hitMode
                                }) : false;
                            },
                            onDrop: function (dragNode, targetNode, hitMode, ui, draggable)
                            {
                                viewSelf.options.dnd.callback && viewSelf.options.dnd.callback({
                                    event: 'drop',
                                    dragNode: dragNode, targetNode: targetNode,
                                    hitMode: hitMode, ui: ui, draggable: draggable
                                });
                            },
                            onDragLeave: function (dragNode, targetNode)
                            {
                                viewSelf.options.dnd.callback && viewSelf.options.dnd.callback({ event: 'dragleave', dragNode: dragNode, targetNode: targetNode });
                            }
                        }
                    };
                    _.extend(opts, _.pick(this.options, 'onCreate'));

                    if (this.options.initialNodes)
                        opts.children = this.options.initialNodes;
                    else
                        opts.initAjax = {
                            url: viewSelf.options.initialAjaxUrl,
                            data: viewSelf.options.initialAjaxData,
                            postProcess: function (data, dataType)
                            {
                                if (viewSelf.options.postProcess)
                                    return viewSelf.options.postProcess(data, dataType);
                                else
                                    return data.success && data.items;
                            }
                        }

                    this.$el.dynatree(opts);
                    if (!this.tree)
                    {
                        this.tree = this.$el.dynatree('getTree');
                        this.tree.selectChildrenOnLazyRead = false;
                    }
                    this.$el = this.tree.$tree; // dynatree 'steals' this

                    this.bindContextMenu();

                },
                renameNode: function (node, callback)
                {
                    // Prevent modal actions closing
                    ModalHelper.GlobalDisableHide = true;
                    node.activate();
                    var self = this;
                    var prevTitle = node.data.title;
                    // Disable dynatree mouse- and key handling
                    this.tree.$widget.unbind();
                    // Replace node with <input>
                    var $input = $('<input class="tree-editing-node" value="' + prevTitle + '">'); // .css('z-index', 1000);
                    $(".dynatree-title", node.span).empty().append($input);
                    $(node.span).addClass('editing');
                    // Focus <input> and bind keyboard handler
                    $input
                      .focus()
                      .keydown(function (e)
                      {
                          switch (e.which)
                          {
                              case 27: // [esc]
                                  $input.val(prevTitle);
                                  $(this).blur();
                                  break;
                              case 13: // [enter]
                                  $(this).blur();
                                  break;
                          }
                      }).blur(function (e)
                      {
                          var newTitle = $input.val();
                          callback(newTitle, function (finalNewTitle)
                          {
                              if (_.isString(finalNewTitle))
                              {
                                  ModalHelper.GlobalDisableHide = false;
                                  $(node.span).removeClass('editing');
                                  node.setTitle(finalNewTitle);
                                  // Re-enable mouse and keyboard handlling
                                  self.tree.$widget.bind();
                                  // node.focus();
                                  return true;
                              }
                              else
                              {
                                  e.preventDefault();
                                  e.stopImmediatePropagation();
                                  return false;
                              }

                          });
                      });

                },
                bindContextMenu: function ()
                {
                    if (!this.options.onContextMenu)
                        return;

                    var self = this;

                    this.$el.contextMenu({
                        selector: 'span.dynatree-node:not(.editing)',
                        animation: { duration: 0 },
                        events: {
                            show: function (options)
                            {
                                var node = $.ui.dynatree.getNode(this);
                                if (self.options.nodeActionOnContext)
                                {
                                    switch (self.options.nodeActionOnContext)
                                    {
                                        case 'focus':
                                            node.focus();
                                            break;
                                        case 'activate':
                                            node.activate();
                                            break;
                                    }
                                }

                            }
                        },
                        build: function ($node, e)
                        {
                            var node = $.ui.dynatree.getNode($node);
                            return self.options.onContextMenu(node, e);
                        }
                    });
                },
                customTrigger: function (parentType, eventName)
                {
                    var args = Array.prototype.slice.call(arguments, 2);
                    this.trigger.apply(this, [parentType, eventName].concat(args));
                    this.trigger.apply(this, [parentType + ':' + eventName].concat(args));
                },
                setData: function (data)
                {

                },
                getRoot: function ()
                {
                    return this.tree.getRoot();
                },
                getNodeByKey: function (key)
                {
                    return this.tree.getNodeByKey(key);
                },
                selectKey: function (key)
                {
                    return this.tree.selectKey(key);
                },
                getActiveNode: function ()
                {
                    return this.tree.getActiveNode();
                },
                getNode: function ($span)
                {
                    return this.tree.getNode($span);
                },
                isInitializing: function ()
                {
                    return this.tree.isInitializing();
                },
                reload: function ()
                {
                    this.tree.reload();
                },
                getSelectedNodes: function ()
                {
                    return this.tree.getSelectedNodes();
                }
            });
    }
)
