define(['require', 'marionette', 'App', 'logger', './FileListView'],
    function (require, Marionette, App, Logger, FileListView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new FileListView(options);
            }
        }
    }
)
