define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger','text!./marketplacelatest.html'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, marketplaceLatestHtml)
    {
        "use strict"

        return Marionette.Layout.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.Layout.prototype.constructor.apply(this, arguments);
                },
                regions: {

                },
                ui: {
                },
                template: Swig.compile(marketplaceLatestHtml),
                tagName: 'div',
                onRender: function ()
                {
                },
                onDomRefresh: function ()
                {
                },
                onClose: function ()
                {
                }
            });
    }
)
