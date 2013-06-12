define(['require', 'backbone','marionette', 'App', 'logger', './ScriptParametersBuilderView','./ScriptParametersBuilderModal','document'],
    function (require, Backbone,Marionette, App, Logger, ScriptParametersBuilderView,ScriptParametersBuilderModal,Document)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new ScriptParametersBuilderView(options);
            },
            showModal: function (options)
            {
                var modal = new ScriptParametersBuilderModal(options);
                modal.show();
                return modal;

            }
        }
    }
)
