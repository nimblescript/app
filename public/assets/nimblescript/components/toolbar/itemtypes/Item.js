define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger'],
    function (require, Backbone, Marionette, $, App, Swig, Logger)
    {
        "use strict"

        function ToolbarItem()
        {

        }
        ToolbarItem.extend = Backbone.Model.extend;

        _.extend(ToolbarItem.prototype, 
            {
                itemType: '',
                render: function ()
                {
                    throw new Error('Not implemented');
                }
            },Backbone.Events);

        return ToolbarItem;

    }
);