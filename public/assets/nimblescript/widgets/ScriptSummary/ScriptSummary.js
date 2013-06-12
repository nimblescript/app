define(['require', 'marionette', 'jquery', 'underscore', 'Vent', 'App', 'logger', 'widget'],
    function (require, Marionette, $, _, Vent, App, Logger,Widget)
    {
        "use strict"
        var SCRIPT_BROWSER_WIDGET_ID = 'xemware.nimblescript.widget.repositorybrowser';

        var ScriptSummaryWidget = Widget.extend(
            {
                constructor: function()
                {
                    Widget.prototype.constructor.apply(this,arguments)
                },
                id: 'xemware.nimblescript.widget.scriptsummary',
                title: 'Script Summary',
                init: function()
                {
                    this._super.apply(this, arguments);
                },
                close: function()
                {
                    this.stopListening();
                },
                beforeShow: function ()
                {
                    var self = this;
                    // Need to hook into RepositoryBrowser widget events as it can be shown/hidden at any time
                    this.listenTo(this.widgetManager, 'shown', function (e)
                    {
                        if (e.widget.id == SCRIPT_BROWSER_WIDGET_ID)
                            self.listenToRepositoryBrowser();
                    });
                    this.listenToRepositoryBrowser();
                },
                listenToRepositoryBrowser: function()
                {
                    var self = this;
                    var scriptBrowserWidget = this.widgetManager.getWidgetInstance(SCRIPT_BROWSER_WIDGET_ID);
                    if (scriptBrowserWidget)
                    {
                        this.listenTo(scriptBrowserWidget, 'node:click', function(tree,node)
                        {
                            if (node.data.isFolder)
                                self.view.setEmpty()
                            else
                            {
                                if (!self.view)// Not rendered yet
                                    self.afterRenderPath = node.data.key;
                                else
                                    self.view.loadSummary(node.data.key);
                            }
                        })
                    }
                },
                renderContent: function (callback)
                {
                    var self = this;
                    App.execute('components:get', ['xemware.nimblescript.component.scriptsummary'], function (err, Components)
                    {
                        self.view = Components[0].createView();
                        var $el = self.view.render().$el;
                        if (self.afterRenderPath)
                            self.view.loadSummary(self.afterRenderPath);
                        callback($el);
                    });
                }
            })

        return ScriptSummaryWidget;

    }
)