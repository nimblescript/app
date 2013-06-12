define(['require', 'marionette', 'App', 'logger', './RepositoryBrowserView'],
    function (require, Marionette, App, Logger, RepositoryBrowserView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new RepositoryBrowserView(options);
            }
        }
    }
)
