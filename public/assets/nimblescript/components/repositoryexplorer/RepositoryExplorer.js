define(['require', 'marionette', 'App', 'logger', './RepositoryExplorerView', './RepositoryExplorerModal'],
    function (require, Marionette, App, Logger, RepositoryExplorerView, RepositoryExplorerModal)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new RepositoryExplorerView(options);
            },
            showModal: function (options)
            {
                var modal = new RepositoryExplorerModal(options);
                modal.show();
                return modal;
            }
        }
    }
)
