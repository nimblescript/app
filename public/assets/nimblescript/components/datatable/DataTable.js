define(['require','marionette', 'App', 'logger','./DataTableView'],
    function (require, Marionette, App, Logger, DataTableView)
    {
        "use strict"

        /* Wrapper around DataTable library */
        return {
            createView: function (options)
            {
                return new DataTableView(options);
            }
        }
    }
)
