define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger',
    './itemtypes/Button'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ButtonToolbarItem)
    {
        "use strict"

        var typeFactory = [
        {
            type: 'button',
            constructor: function (options) { return new ButtonToolbarItem(options); }
        }];

        return {
            createItem: function (type, options)
            {
                return createItem(type, options);
            }
        }


        function createItem(type, options)
        {
            var factory = _.find(typeFactory, { type: type });
            return factory ? factory.constructor(options) : null;
        }

    }
);