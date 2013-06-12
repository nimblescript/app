define(['require', 'backbone','marionette', 'App', 'logger', './SettingsView','./SettingsModal'],
    function (require, Backbone,Marionette, App, Logger, SettingsView,SettingsModal)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new SettingsView(options);
            },
            showModal: function (options)
            {
                var modal = new SettingsModal(options);
                modal.show();
                return modal;

            }
        }
    }
)
