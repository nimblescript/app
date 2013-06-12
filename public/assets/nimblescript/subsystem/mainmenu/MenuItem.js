define(['jquery', 'underscore', 'marionette', 'swig', 'backbone', 'Vent', 'text!./menuitem.html', 'translate'],
    function ($, _, Marionette, Swig,Backbone, Vent, menuItemHtml,T)
    {
        "use strict";
        return Marionette.CompositeView.extend({
            template: Swig.compile(menuItemHtml),
            tagName: 'li',
            constructor: function (options)
            {
                _.bindAll(this);
                Marionette.CompositeView.prototype.constructor.apply(this, arguments);
            },
            events: {
                'click a:not(.disabled)': 'menuClicked'
            },
            modelEvents: {
                'change': 'modelChanged'
            },
            modelChanged: function()
            {
                var h = this.render();
                // this.$el.html(h.el);
                this.augmentItem(this)
            },
            initialize: function(options)
            {
                this.collection = this.model.get('subitems');
                Marionette.CompositeView.prototype.initialize.call(this, options);
                // this._super(options);
            },
            render: function()
            {
                if (this.model.get('i18n'))
                    this.model.set('translatedlabel', T.t(this.model.get('i18n'), { defaultValue: this.model.get('label') }), { silent: true });
                this._super();
            },
            onRender: function ()
            {
                if (this.model.get('subitems'))
                    this.$el.addClass('dropdown');
                if (this.model.get('disabled'))
                    this.$el.children('a').addClass('disabled');
                if (this.model.get('label') == '-' )
                    this.$el.addClass('divider')
            },
            appendHtml: function (collectionView, itemView,index)
            {
                if (!index)
                    collectionView.$el.children('ul').prepend(itemView.$el);
                else
                    collectionView.$el.find('> ul > li').eq(index - 1).after(itemView.$el);

                this.augmentItem(itemView);
            },
            augmentItem: function (item)
            {
                if (item.model.get('subitems'))
                {
                    if (!item.model.get('submenu'))
                    {
                        item.$el.addClass('dropdown');
                        item.$el.children('a').addClass('dropdown-toggle').attr('data-toggle', 'dropdown').append('<span class="caret"></span>');
                    }
                    else
                        item.$el.addClass('dropdown-submenu');
                }

            },
            menuClicked: function (e)
            {
                if (this.model.id == e.currentTarget.id)
                {
                    Vent.trigger('menu:clicked', this.model);
                    Vent.trigger('menu:clicked:' + this.model.id, this.model);
                }

            }
        });

    }
);