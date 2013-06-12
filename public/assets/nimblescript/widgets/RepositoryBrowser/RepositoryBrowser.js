define(['require', 'marionette', 'jquery', 'underscore', 'Vent', 'App', 'logger', 'widget', 'css!./widget'],
    function (require, Marionette, $, _, Vent, App, Logger,Widget,css)
    {
        "use strict"


        var RepositoryBrowserWidget = Widget.extend(
            {
                constructor: function()
                {
                    _.bindAll(this);
                    Widget.prototype.constructor.apply(this,arguments)
                },
                id: 'xemware.nimblescript.widget.repositorybrowser',
                title: 'Repository Browser',
                beforeShow: function ()
                {
                },
                renderContent: function (callback)
                {
                    var self = this;
                    App.execute('components:get', ['xemware.nimblescript.component.repositorybrowser'], function (err, Components)
                    {
                        self.repositoryBrowserView = Components[0].createView({ initialPath: self.options.persistedData});
                        var $el = self.repositoryBrowserView.render().$el;
                        self.listenToEvents();
                        callback($el);

                    });
                },
                listenToEvents: function ()
                {
                    var self = this;
                    // Bubble events
                    this.listenTo(this.repositoryBrowserView, 'all', this.onViewEVent);

                    var settingsManager = App.request('settings:getmanager');
                    this.listenTo(settingsManager, 'updated', function()
                    {
                        self.repositoryBrowserView.populate();
                    })

                    var repositoryManager = App.request('repository:getmanager');
                    this.listenTo(repositoryManager, 'all', function ()
                    {
                        console.log(arguments);
                    })
                },
                onViewEVent: function (eVentName)
                {
                    this.trigger.apply(self, arguments)
                },
                buttons: function()
                {
                    return ['cog']
                },
                onButton: function (action)
                {
                    switch (action)
                    {
                        case 'cog':
                            var settingsManager = App.request('settings:getmanager');
                            settingsManager.showModal({ initialSection: 'repositories' });
                            break;
                    }
                },
                getPersistenceData: function ()
                {
                    if (!this.repositoryBrowserView) // Not initialized yet
                        return;

                    var activeNode = this.repositoryBrowserView.activeNode();
                    return activeNode && activeNode.data.key;
                }
            })

        return RepositoryBrowserWidget;

    }
)