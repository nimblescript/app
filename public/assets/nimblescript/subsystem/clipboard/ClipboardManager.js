define(['require', 'jquery', 'backbone', 'underscore', 'Vent', 'App', 'logger'],
    function (require, $, Backbone,_, Vent, App, Logger)
    {
        "use strict"


        function ClipboardManager()
        {
        }

        _.extend(ClipboardManager.prototype, Backbone.Events, {
            init: function (options)
            {
                this.menuManager = App.request('menu:getmanager');
                this.trigger('ready');
            }
        })

        var clipboardManager = new ClipboardManager();

        App.reqres.setHandler('clipboard:getmanager', function ()
        {
            return clipboardManager;
        })

        return clipboardManager;
    }
);