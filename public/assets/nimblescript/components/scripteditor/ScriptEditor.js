define(['require', 'marionette', 'App', 'logger', './ScriptEditorView'],
    function (require, Marionette, App, Logger, ScriptEditorView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new ScriptEditorView(options);
            }
        }
    }
)
