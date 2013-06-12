define(['require', 'marionette', 'jquery', 'underscore', 'Vent', 'App', 'logger', 'widget', './FavoritesBrowserView'],
    function (require, Marionette, $, _, Vent, App, Logger,Widget, FavoritesBrowserView)
    {
        "use strict"

        var FavoritesWidget = Widget.extend(
            {
                constructor: function()
                {
                    Widget.prototype.constructor.apply(this,arguments)
                },
                id: 'xemware.nimblescript.widget.favorites',
                title: 'Favorites',
                init: function()
                {
                    this._super.apply(this, arguments);
                },
                renderContent: function (callback)
                {
                    var self = this;
                    var $el = new FavoritesBrowserView().render().$el;
                    callback($el);
                }
            })

        return FavoritesWidget;

    }
)