define(['jquery', 'underscore', 'marionette', 'backbone', 'Vent'],
    function ($, _, Marionette, Backbone, Vent)
    {
        _.each(
        [
            "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"
        ],function (method)
        {
            console[method] = this.bind(console[method], console);
        }, Function.prototype.call);
        
        return {
            log: function ()
            {
                console.log.apply(console, arguments);
            },
            debug: function ()
            {
                var func = console.debug || console.log;
                func.apply(console, arguments);
            }
        }
    }
    );
