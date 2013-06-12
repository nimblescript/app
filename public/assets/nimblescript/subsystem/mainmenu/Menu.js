/* 
    Represents the main menu bar.
    Do I need to have separate Menu and MenuItem classes?
*/ 

define(['require','jquery', 'underscore', 'marionette', 'backbone', 'Vent', './MenuItem',
    'text!./basemenu.json', 'App', 'logger', 'css!./menu'],
    function (require,$, _, Marionette, Backbone, Vent, MenuItem,  baseMenuText,app, logger)
    {
        "use strict";
        function addItems(collection, items)
        {
            _.each(items, function(v)
            {
                var model = new Backbone.Model(_.omit(v, 'subitems'));
                collection.add(model);
                if (v.subitems)
                {
                    var c = new Backbone.Collection();
                    // c.submenu = true;
                    model.set('subitems', c);
                    model.set('submenu', true);
                    addItems(c, v.subitems);
                }
            })
        }

        var defaultMenu = new Backbone.Collection();
        addItems(defaultMenu, JSON.parse(baseMenuText));

        var Menu = Marionette.CollectionView.extend({
            itemView: MenuItem,
            tagName: 'ul',
            className: 'nav',
            constructor: function (options)
            {
                this.collection = defaultMenu;
                _.bindAll(this);
                Marionette.CollectionView.prototype.constructor.apply(this, arguments);

            },
            initialize: function (options)
            {
                if (!this.collection)
                    this.collection = defaultMenu;
                Marionette.CollectionView.prototype.initialize.call(this,options);
            },
            appendHtml: function (collectionView, itemView, index)
            {
                if (!index)
                    collectionView.$el.prepend(itemView.$el);
                else
                    collectionView.$el.find('> li').eq(index-1).after(itemView.$el);

                if (itemView.model.get('subitems'))
                {
                    itemView.$el.children('a').addClass('dropdown-toggle').attr('data-toggle', 'dropdown').append('<span class="caret"></span>');
                }
                
                // TODO: Use Marionette eVent handling model so we don't have to do check
                if (itemView.addedHandlers)
                    return;

                itemView.addedHandlers = true;
                itemView.$el.on('click.menuitem', 'a[id="' + itemView.model.id + '"]', function (e)
                {
                    Vent.trigger('menu:clicked', itemView.model);
                    Vent.trigger('menu:clicked:' + itemView.model.id, itemView.model);
                });
                itemView.$el.on('opened.menuitem', function (e)
                {
                    Vent.trigger('menu:opened', itemView.model);
                    Vent.trigger('menu:opened:' + itemView.model.id, itemView.model);
                });
                itemView.$el.on('closed.menuitem', function (e)
                {
                    Vent.trigger('menu:closed', itemView.model);
                    Vent.trigger('menu:closed:' + itemView.model.id, itemView.model);
                });
            },
            onShow: function()
            {
                Vent.trigger('menu:initdone');
            },
            events: 
            {
                // PreVent click of disabled items closing menu
                'click a.disabled, li.dropdown-submenu > a': function(e) { e.preventDefault(); e.stopPropagation(); return false; }
            },
            // Extra
            findMenu: function (id)
            {
                var collectionStack = [];
                var currentCollection = this.collection;
                while (currentCollection)
                {
                    var i = currentCollection.where({ id: id });
                    if (i.length)
                        return i.pop();
                    _.each(currentCollection.models, function (v)
                    {
                        if (v.attributes.subitems)
                            collectionStack.push(v.attributes.subitems);
                    });
                    currentCollection = collectionStack.pop();
                }
            }
        });


        // Show menu
        app.addInitializer(function ()
        {
            var menu = new Menu();

            app.reqres.setHandler('menu:getmanager', function ()
            {
                return menu;
            })

            Vent.on('menu:clicked', function (model)
            {
                var command = model.get('command');
                if (command)
                {
                    logger.debug('Menu command:', command);
                    try
                    {
                        app.execute(command, model);
                    }
                    catch (e)
                    {
                        logger.debug(e.toString());
                    }
                }
            });

            app.menubar.show(menu)


        });

  
    }
);