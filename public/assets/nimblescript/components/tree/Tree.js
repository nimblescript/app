define(['require','marionette', 'App', 'logger','./TreeView'],
    function (require, Marionette, App, Logger, TreeView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new TreeView(options);
            }
        }
    }
)
