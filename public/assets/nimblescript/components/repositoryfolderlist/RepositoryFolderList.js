define(['require', 'marionette', 'App', 'logger', './DirectoryListView'],
    function (require, Marionette, App, Logger, DirectoryListView)
    {
        "use strict"

        /* Wrapper around DataTable library */
        return {
            createView: function (options)
            {
                return new DirectoryListView(options);
            }
        }
    }
)
