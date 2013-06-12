define(['require','marionette', 'App', 'logger','./ScriptRunHistoryView'],
    function (require, Marionette, App, Logger, ScriptRunHistoryView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new ScriptRunHistoryView(options);
            }
        }
    }
)
