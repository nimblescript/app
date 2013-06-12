define(['require', 'marionette', 'App', 'logger', './PublishScriptView', './PublishScriptModal','./Publisher'],
    function (require, Marionette, App, Logger, PublishScriptView, PublishScriptModal, Publisher)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new PublishScriptView(options);
            },
            showModal: function (options)
            {
                var modal = new PublishScriptModal(options);
                modal.show();
                return modal;
            },
            createPublisher: function (options)
            {
                return new Publisher(options);
            }
        }
    }
)
