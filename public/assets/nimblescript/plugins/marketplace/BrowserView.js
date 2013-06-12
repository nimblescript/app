define(['marionette', 'backbone', 'underscore', 'swig', 'Vent', 'jquery', 'App','text!./browser.html'],
    function (Marionette, Backbone, _, Swig, Vent, $, App,html)
    {
        "use strict";
        return Marionette.ItemView.extend({
            constructor: function()
            {
                _.bindAll(this);
                Marionette.ItemView.prototype.constructor.apply(this, arguments);
            },
            template: Swig.compile(html),
            className: 'marketplace-browser',
            events:
                {
                }
        })
    }
)