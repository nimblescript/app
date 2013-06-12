define(['require', 'marionette', 'App', 'logger', './FileListEditorView'],
    function (require, Marionette, App, Logger, FileListEditorView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new FileListEditorView(options);
            }
        }
    }
)
