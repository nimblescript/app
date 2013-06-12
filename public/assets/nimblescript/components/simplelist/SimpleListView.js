define(['require', 'backbone', 'marionette', 'jquery','App', 'swig', 'logger', 'jquery.ui'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, $jqueryui)
    {
        "use strict"

        var DefaultItemView = Marionette.ItemView.extend(
            {
                template: Swig.compile('<div>{{ text }}</div>'),
                tagName: 'li'
            });

        return Marionette.CollectionView.extend(
            {
                constructor: function (options)
                {
                    _.bindAll(this);

                    options = options || {};
                    Marionette.CollectionView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(''),
                tagName: 'ul',
                itemView: DefaultItemView,
                initialize: function(options)
                {
                    if (!this.collection)
                        this.collection = new Backbone.Collection();
                    this.options = _.defaults({}, options, { selectable: true, sortable: false });
                    this._super();
                },
                collectionEvents: {
                    'add': 'init'
                },
                onRender: function ()
                {
                    this.init();
                },
                init: function()
                {
                    var self = this;
                    this.$el.selectable({
                        selected: this._onSelected,
                        tolerance: 'fit'
                    });
                    this.$el.children().on('dblclick', this._onDblClick);
                },
                selectItem: function(index)
                {
                    this.$el.data('uiSelectable').refresh();
                    this.$el.children().removeClass("ui-selected").addClass('ui-unselecting');
                    var $itemEl = this.$el.children(':eq(' + index + ')').addClass('ui-selecting');
                    this.$el.data('uiSelectable')._mouseStop.call(this.$el.data('uiSelectable'),null);
                    
                },
                onAfterItemAdded: function(itemView)
                {
                    itemView.$el.data('itemview', itemView);
                },
                _onSelected: function(e, ui)
                {
                    this.trigger('selected', ui, $(ui.selected).data('itemview').model);
                    this.options.onSelected && this.options.onSelected(ui, $(ui.selected).data('itemview').model)
                },
                _onDblClick: function(e)
                {
                    this.trigger('dblclick', e.currentTarget);
                },
                onDomRefresh: function()
                {
                },
                customTrigger: function (parentType, eVentName)
                {
                    var args = Array.prototype.slice.call(arguments, 2);
                    this.trigger.apply(this, [parentType, eVentName].concat(args));
                    this.trigger.apply(this, [parentType + ':' + eVentName].concat(args));
                }
            });
    }
)
