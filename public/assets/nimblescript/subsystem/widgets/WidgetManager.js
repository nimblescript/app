define(['require', 'jquery', 'underscore', 'Vent', 'App','backbone', 'logger', 'cookie','./WidgetContainer'],
    function (require, $, _, Vent, App, Backbone, Logger, Cookie, WidgetContainer)
    {
        "use strict"



        function WidgetManager()
        {
            this.setState('pre-init');
        }

        _.extend(WidgetManager.prototype, Backbone.Events,
            {
                init: function (options)
                {
                    this.widgets = {};
                    this.menuManager = App.request('menu:getmanager');
                    this.widgetsMenu = this.menuManager.findMenu('view.widgets');
                    this.loadWidgets();
                    this.trigger('ready');
                },
                _trigger: function (eVentName, container, exData)
                {
                    var eVentData = _.extend({}, {
                        container: container,
                        widget: container.widget
                    }, exData);
                    this.trigger(eVentName, eVentData);
                    return eVentData;
                },
                state: function ()
                {
                    return this._state;
                },
                setState: function (state)
                {
                    if (state != this._state)
                    {
                        this._state = state;
                        this.trigger('state-change', state);
                    }
                },
                loadWidgets: function ()
                {
                    var self = this;
                    this.setState('init');
                    App.serverCommand(
                        {
                            url: '/widgets/installed',
                            success: function (result)
                            {
                                _.each(result.widgets, function (widgetManifest)
                                {
                                    self.register(widgetManifest);
                                })
                                self.setState('ready');
                                self.updateMenu();
                            },
                            error: function ()
                            {
                                self.setState('error');
                            }
                        })

                    
                },
                toggle: function(widgetId)
                {
                    var widget = this.getWidget(widgetId);
                    if (!widget)
                        return;

                    if (!widget.container) // Don't do anything if already showing
                        this.show(widgetId);
                    else
                        this.close(widgetId);
                },
                show: function (widgetId, options)
                {
                    var loadingLayout = this._loadingLayout;
                    options = options || {};

                    var widget = this.getWidget(widgetId);
                    if (!widget || widget.container) // Don't do anything if already showing
                        return;

                    if (_.isFunction(widget.Constructor))
                    {
                        widget.Constructor(_show);
                    }
                    else if (_.isString(widget.Constructor))
                    {
                        require([widget.Constructor], function (Widget)
                        {
                            _show(new Widget)
                        });
                    }

                    var self = this;
                    function _show(instance)
                    {
                        instance.init(self,options);
                        widget.container = new WidgetContainer({ widget: instance, widgetManager: self });
                        self.$containers.first().append(widget.container.render().$el);
                        self.menuManager.findMenu('widget.' + _.result(widget, 'id')).set('visible', true);
                        instance.beforeShow();
                        self._trigger('shown', widget.container)

                        if (!loadingLayout)
                            self.saveLayout();
                    }

                    

                },
                getWidget: function (widgetId)
                {
                    if (!this.widgets[widgetId])
                        return;

                    return this.widgets[widgetId];

                },
                close: function (widgetId, options)
                {
                    var widget = this.getWidget(widgetId);
                    if (!widget || !widget.container)
                        return;

                    this._trigger('closing', widget.container)
                    widget.container.close();
                    this._trigger('closed', widget.container)
                    delete widget.container;
                    this.menuManager.findMenu('widget.' + _.result(widget, 'id')).set('visible', false);

                    if (!this._loadingLayout)
                        this.saveLayout();

                    

                },
                loadLayout: function()
                {
                    this._loadingLayout = true;
                    var self = this;
                    var widgetLayoutText = Cookie.get('ns-widget-layout');
                    if (widgetLayoutText)
                    {
                        try
                        {
                            var widgetLayout = JSON.parse(widgetLayoutText);
                            _.each(widgetLayout, function(widgetInstance)
                            {
                                self.show(widgetInstance.id, { persistedData: widgetInstance.p } );
                            })
                            
                        }
                        catch (e)
                        {
                            // Ignore
                        }
                    }
                    this._loadingLayout = false;
                },
                /**
                 * Store current widget layout - to cookie for time being.  
                 *
                 */
                saveLayout: function ()
                {
                    var self = this;
                    var $activeWidgets = this.$containers.find('.widget[widget-id]');
                    var widgetLayout = [];
                    _.each($activeWidgets, function (widgetElement,index)
                    {
                        var $el = $(widgetElement);
                        var widgetId = $el.attr('widget-id');
                        try
                        {
                            var persistenceData = _.result(self.getWidget(widgetId).container.widget, 'getPersistenceData');
                            // var parentContainer = <support multiple containers>
                            widgetLayout.push({ id: widgetId, idx: index, p: persistenceData });
                        }
                        catch(e)
                        {
                            // Ignore
                        }
                    });
                    Cookie.set('ns-widget-layout', JSON.stringify(widgetLayout), { expires: 100000 });

                    
                },
                register: function (widgetManifest)
                {
                    this.widgets[widgetManifest.id] = widgetManifest;
                    this.updateMenu('register', widgetManifest);
                },
                unregister: function (widgetId)
                {
                    this.updateMenu('unregister', this.widgets[widgetId])
                    delete this.widgets[widgetId];
                },
                updateMenu: function (action, widgetManifest)
                {
                    if (action == 'register')
                        this.widgetsMenu.get('subitems').add(
                            {
                                id: 'widget.' + _.result(widgetManifest, 'id'),
                                widget_id: _.result(widgetManifest, 'id'),
                                label: _.result(widgetManifest, 'title'),
                                href: '#',
                                command: 'widgets:show'
                            })
                    if (action == 'unregister')
                        ;

                    if (_.keys(this.widgets).length)
                    {
                        var noWidgetsMenuItem = this.menuManager.findMenu('view.widgets.none');
                        if (noWidgetsMenuItem)
                            this.widgetsMenu.get('subitems').remove(noWidgetsMenuItem);
                    }
                    else
                    {
                        widgetsMenu.get('subitems').add(
                                {
                                    "id": "view.widgets.none",
                                    "label": "No Widgets",
                                    "href": "#",
                                    "i18n": "view.widgets.none",
                                    "disabled": true
                                });
                    }
                },
                // Called by MainView to specify containers for widgets
                // TODO: Review container management and flow of events
                setContainers: function ($selector)
                {
                    var self = this;
                    this.$containers = $($selector);
                    this.$containers.on('layout-change', function ()
                    {
                        self.saveLayout();
                    });
                    this.loadLayout();
                },
                getWidgetInstance: function (widgetId)
                {
                    var widget = this.getWidget(widgetId);
                    if (!widget || !widget.container)
                        return;
                    return widget.container.widget;
                }
            })

        var widgetManager = new WidgetManager();

        App.reqres.setHandler('widgets:getmanager', function ()
        {
            return widgetManager;
        })

        App.commands.setHandler('widgets:show', function (menu)
        {
            widgetManager.toggle(menu.get('widget_id'));
        })

        return widgetManager;
    }
);