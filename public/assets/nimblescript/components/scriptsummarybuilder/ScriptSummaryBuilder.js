define(['require', 'backbone','marionette', 'App', 'logger', './ScriptSummaryBuilderView','./ScriptSummaryBuilderModal','document'],
    function (require, Backbone,Marionette, App, Logger, ScriptSummaryBuilderView,ScriptSummaryBuilderModal,Document)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new ScriptSummaryBuilderView(options);
            },
            showModal: function (options)
            {
                var modal = new ScriptSummaryBuilderModal(options);
                modal.show();
                return modal;

            }
        }
    }
)
