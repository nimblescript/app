define(['require', 'marionette', 'App', 'logger', './ScriptSummaryView'],
    function (require, Marionette, App, Logger, ScriptSummaryView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new ScriptSummaryView(options);
            }
        }
    }
)
