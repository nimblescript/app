define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./startpage.html', 'css!./startpage.css',
    './MarketplaceLatest','./BlogLatest'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, startPageHtml,startPageCss, MarketplaceLatest, BlogLatest)
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
                    marketplaceLatest: 'div.marketplace-latest',
                    blogLatest: 'div.blog-latest'
                },
                events: {
                    'change [name=at-startup]': 'changeAtStartup',
                },
                ui: {
                    atStartup: '[name=at-startup]'
                },
                template: Swig.compile(startPageHtml),
                tagName: 'div',
                className: 'start-page',
                onRender: function ()
                {
                    this.ui.atStartup.val(this.model.get('atStartup'));
                    this.marketplaceLatest.show(new MarketplaceLatest)
                    this.blogLatest.show(new BlogLatest)
                },
                onDomRefresh: function ()
                {
                },
                onClose: function ()
                {
                },
                changeAtStartup: function (e)
                {
                    var self = this;
                    App.execute('settings:get', function (settings)
                    {
                        settings.startup.atStartup = self.ui.atStartup.val();
                        App.execute('settings:save', settings);
                    })

                }
            });
    }
)
