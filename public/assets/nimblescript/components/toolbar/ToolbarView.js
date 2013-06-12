define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 
    'text!./toolbar.html', 'css!./toolbar.css', './ItemFactory'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, html, css, ItemFactory)
    {
        "use strict"

        var View = Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(html),
                tagName: 'div',
                className: 'toolbar',
                initialize: function (options)
                {
                    this._items = [];
                },
                onRender: function ()
                {
                    var self = this;
                    _.each(this._items, function (item)
                    {
                        self.$el.append(item.render());
                    });
                    
                },
                listenToEvents: function ()
                {
                },
                onShow: function ()
                {

                },
                createItem: function (type, options)
                {
                    return ItemFactory.createItem(type, options);
                },
                addItem: function (item)
                {
                    if (!(item in this._items))
                        this._items.push(item);

                },
                removeItem: function (itemRef)
                {

                }

            });

        View.createItem = function (type, options)
        {
            return ItemFactory.createItem(type, options);
        }


        return View;
    }
)
