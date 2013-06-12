define(['require','marionette', 'App', 'logger','./SimpleListView'],
    function (require, Marionette, App, Logger, SimpleListView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new SimpleListView(options);
            }
        }
    }
)
