define(['require', 'underscore','marionette', 'App', 'logger','modalhelper' ,'./StartPageView'],
    function (require, _,Marionette, App, Logger,ModalHelper,StartPageView)
    {
        "use strict"
        function StartPageModal(options)
        {
            this.options = options || {};
        }

        _.extend(StartPageModal.prototype, {
            show: function ()
            {
                var self = this;
                var settingsManager = App.request('settings:getmanager');
                var view = new StartPageView({ model: new Backbone.Model({ atStartup: settingsManager.lastUserSettings.startup.atStartup}) });
                var modalHelper = new ModalHelper();
                modalHelper.view({
                    view: view, width: 700, height: 400,
                    title: 'Welcome to nimbleScript',
                    buttons: [{ text: 'OK' }],
                    onButton: function (id)
                    {
                        return true;
                    }

                });


            }
        });

        return StartPageModal;

    }
)
