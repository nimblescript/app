
// Contrived example of hooking into document events and modifying a view 
// In this case adding a button to the File List Editor when it is created
define(function (require, exports, module)
{
    "use strict"
    
    module.exports = function (register)
    {
        var _ = require('underscore')
            , Backbone = require('backbone')
            , App = require('App')
            , Logger = require('logger')

        Logger.log('Running File List Editor extension plugin');
        App.on('subsystems:loaded', function()
        {
            hookFileListEditor();
        });
        

        register(
            {
                id: 'xemware.nimblescript.plugin.filelisteditorextension',
                about: function ()
                {
                    return "Adds a button to the File List Editor view"
                },
                version: function ()
                {
                    return "1.0.0"
                }
            }
        );

        function hookFileListEditor()
        {
            var documentManager = App.request('documents:getmanager');
            documentManager.listenTo(documentManager, 'all', function (eVentName, e)
            {
                // Only interested in documents that have a fileListEditor property
                // TODO: Should really have a standard property for indicating document type, 
                if (eVentName == 'adding' && _.result(e.document, 'fileListEditor'))
                {
                    e.document.on('ready', function ()
                    {
                        addButtonToFileListEditor(e.document.view);
                    });
                }

            })

            // TODO: Standardised model for notifying of component events, or component implements their own?
            var componentManager = App.request('components:getmanager');
            componentManager.listenTo(componentManager, 'component:created', function (id, component)
            {

            });
        }

        

        function addButtonToFileListEditor(view)
        {
            var $btnToolbar = view.$el.find('.btn-toolbar');
            $btnToolbar.append('<div class="btn-group"><button class="btn btn-mini trailing-gap" data-action="noop">Added by a Plugin!</button></div>');
        }
    }
}
);