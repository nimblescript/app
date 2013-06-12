define(['require','marionette', 'App', 'logger','./FolderBrowserView','./FolderBrowserModal'],
    function (require, Marionette, App, Logger, FolderBrowserView, FolderBrowserModal)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new FolderBrowserView(options);
            },
            showModal: function (options)
            {
                var modal = new FolderBrowserModal(options);
                modal.show();
                return modal;

            }
        }
    }
)
