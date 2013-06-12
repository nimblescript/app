define(function (require, exports, module)
{
    "use strict"
    
    module.exports = function (register)
    {
        var _ = require('underscore')
            , Backbone = require('backbone')
            , App = require('App')
            , Logger = require('logger')


        register(
            {
                id: 'xemware.nimblescript.plugin.favorites',
                about: function ()
                {
                    return "Favorites plugin"
                },
                version: function ()
                {
                    return "1.0.0"
                }
            }
        );

        function FavoritesManager()
        {
            this.init();
            
            // this.cache = {};
        }

        
        _.extend(FavoritesManager.prototype, Backbone.Events,
            {
                init: function()
                {
                    var self = this;
                    this.listenTo(this, 'favorite:loaded', function (name, favorite)
                    {
                        self.addToCache(name, favorite);
                    });
                    this.listenTo(this, 'favorite:saved', function (name, favorite)
                    {
                        self.addToCache(name, favorite);
                    });
                    this.listenTo(this, 'favorite:deleted', function (name)
                    {
                        self.removeFromCache(name);
                    });
                    var widgetManager = App.request('widgets:getmanager');
                    widgetManager.register({
                        id: "xemware.nimblescript.widget.favorites",
                        title: "Favorites Browser",
                        Constructor: function (callback)
                        {
                            require(['./FavoritesWidget'], function (FavoritesWidget)
                            {
                                callback(new FavoritesWidget())
                            });
                            
                        },
                        description: "Browse and action favorites"
                    })

                },
                search: function (options,callback)
                {
                    var self = this;
                    options = _.defaults({}, options);
                    var favorites = [];
                    if (!options.noCache && this.cache)
                    {
                        favorites = this.searchCache(options);
                        if (favorites)
                            return (callback && callback(null,favorites));
                    }

                    return App.serverCommand(
                        {
                            url: '/favorites',
                            data: { filter: options.filter && JSON.stringify(options.filter)},
                            success: function(response)
                            {
                                callback && callback(!response.success && response.messages, response && response.items);

                            },
                            error: function ()
                            {
                                callback && callback(arguments);
                            }
                        })
                },
                searchCache: function (options)
                {
                    options = _.defaults({}, options);
                    return !_.isEmpty(this.cache) && options.filter
                        ? _.filter(this.cache, options.filter)
                        : this.cache;
                },
                removeFromCache: function(name)
                {
                    if (this.cache)
                        delete this.cache[name];
                },
                addToCache: function(name, favorite)
                {
                    if (!this.cache)
                        this.cache = {};
                    this.cache[name] = favorite;
                },
                loadFavorite: function (name, options,callback)
                {
                    var self = this;
                    options = options || {};
                    return App.serverCommand(
                        {
                            url: '/favorites/' + encodeURIComponent(name),
                            success: function (response)
                            {
                                callback && callback(!response.success && response.messages, response.favorite);
                                if (response.sucess)
                                    self.trigger('favorite:loaded', name, response.favorite);
                            },
                            error: function ()
                            {
                                callback && callback(arguments);
                            }
                        })
                },
                saveFavorite: function (name, favorite, options,callback)
                {
                    var self = this;
                    options = options || {};
                    return App.serverCommand(
                        {
                            url: '/favorites/' + encodeURIComponent(name),
                            data: { favorite: JSON.stringify(favorite) },
                            type: 'POST',
                            success: function (response)
                            {
                                
                                // TODO: pass back savedAs
                                callback && callback(!response.success && response.messages, response);
                                if (response.success)
                                    self.trigger('favorite:saved', name, favorite);
                            },
                            error: function ()
                            {
                                callback && callback(arguments);
                            }
                        })
                },
                deleteFavorite: function(name, options,callback)
                {
                    var self = this;
                    options = options || {};
                    return App.serverCommand(
                        {
                            url: '/favorites/' + encodeURIComponent(name),
                            type: 'DELETE',
                            success: function (response)
                            {
                                callback && callback(!response.success && response.messages, response);
                                if (response.success)
                                    self.trigger('favorite:deleted', name);
                            },
                            error: function ()
                            {
                                callback && callback(arguments);
                            }
                        })
                },
                renameFavorite: function (name, newName, callback)
                {
                    var self = this;
                    return App.serverCommand(
                        {
                            url: '/favorites/' + encodeURIComponent(name) + '/rename',
                            type: 'POST',
                            data: { newname: newName },
                            success: function (response)
                            {
                                callback && callback(!response.success && response.messages, response);
                                if (response.success)
                                    self.trigger('favorite:renamed', name, newName);
                            },
                            error: function ()
                            {
                                callback && callback(arguments);
                            }
                        })

                }
            })

        init();

        function init()
        {
            var favoritesManager = new FavoritesManager();
            App.reqres.setHandler('favorites:getmanager', function ()
            {
                return favoritesManager;
            })
        }

    }
}
);