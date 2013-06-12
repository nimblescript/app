define(['require', 'backbone','marionette', 'App', 'logger', './StartPageView','./StartPageModal','document'],
    function (require, Backbone,Marionette, App, Logger, StartPageView,StartPageModal,Document)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new StartPageView(options);
            },
            showModal: function (options)
            {
                var modal = new StartPageModal(options);
                modal.show();
                return modal;

            },
            createDocument: function ()
            {
                var StartPageDocument = Document.extend(
                    {
                        constructor: function()
                        {
                            _.bindAll(this);
                            Document.prototype.constructor.apply(this, arguments);
                        },
                        title: 'Start Page',
                        startPage: true,
                        renderContent: function (callback)
                        {
                            var self = this;
                            var settingsManager = App.request('settings:getmanager');
                            self.view = new StartPageView({ model: new Backbone.Model({ atStartup: settingsManager.lastUserSettings.startup.atStartup}) });
                            callback(self.view.render().$el)
                        }
                    })
                return new StartPageDocument();
            }

        }
    }
)
