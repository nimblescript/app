define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './Item','text!./button.html'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ToolbarItem, html)
    {
        "use strict"

        var ButtonToolbarItem = ToolbarItem.extend({
            constructor: function (options)
            {
                _.bindAll(this);
                ToolbarItem.prototype.constructor.apply(this, arguments);
                this.initialize(options);
                
            },
            initialize: function(options)
            {
                this.options = _.defaults({},options, {
                    label: 'button',
                    image: null,
                    imagePosition: 'left',
                    className: null
                });

                var model = new Backbone.Model(
                    {
                        label: this.options.label,
                        image: this.options.image,
                        className: this.options.className,
                        imagePosition: this.options.imagePosition,
                        imageIcon: this.options.imageIcon
                    })

                this.view = new ButtonView({ model: model });

                var self = this;
                this.listenTo(this.view, 'click', function(e)
                {
                    self.trigger('click', self, e);
                })
            },
            itemType: 'button',
            render: function ()
            {
                return this.view.render().$el;
            }
        });

        var ButtonView = Marionette.ItemView.extend({
            template: Swig.compile(html),
            events: {
                'click button': '_onClick'
            },
            _onClick: function (e)
            {
                this.trigger('click', e);
            }
        })
        return ButtonToolbarItem;



    }
);