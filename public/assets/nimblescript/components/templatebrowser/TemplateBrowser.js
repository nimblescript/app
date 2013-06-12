define(['require','marionette', 'App', 'logger','./TemplateBrowserView','./TemplateBrowserModal'],
    function (require, Marionette, App, Logger, TemplateBrowserView, TemplateBrowserModal)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new TemplateBrowserView(options);
            },
            showModal: function (options)
            {
                var modal = new TemplateBrowserModal(options);
                modal.show();
                return modal;

            }
        }
    }
)
