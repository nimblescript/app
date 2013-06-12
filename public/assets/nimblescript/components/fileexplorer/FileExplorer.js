define(['require', 'marionette', 'App', 'logger', './FileExplorerView', './FileExplorerModal'],
    function (require, Marionette, App, Logger, FileExplorerView, FileExplorerModal)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new FileExplorerView(options);
            },
            showModal: function (options)
            {
                var modal = new FileExplorerModal(options);
                modal.show();
                return modal;
            }
        }
    }
)
