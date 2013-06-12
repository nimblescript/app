define(['require', 'marionette', 'App', 'logger', './FileSaverView'],
    function (require, Marionette, App, Logger, FileSaverView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new FileSaverView(options);
            }
        }
    }
)
