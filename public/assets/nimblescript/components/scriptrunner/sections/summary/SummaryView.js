define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./summary.html'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, html)
    {
        "use strict"

        return Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                initialize: function(options)
                {
                    // this.model = new Backbone.Model(options.data);
                },
                events: {
                },
                ui: {
                },
                onShow: function()
                {
                },
                template: Swig.compile(html),
                tagName: 'div'
            });
    }
)
