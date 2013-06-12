define(['require','App', 'logger','./EditorView'],
    function (require, App, Logger, EditorView)
    {
        "use strict"

        /* Wrapper around Editor library */
        return {
            createView: function (options)
            {
                return new EditorView(options);
            }
        }
    }
)
