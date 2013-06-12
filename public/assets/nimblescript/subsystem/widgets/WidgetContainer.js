define(['require', 'jquery', 'underscore', 'marionette', 'App', 'backbone', 'swig', 'text!./widgetcontainer.html'],
    function (require, $, _, Marionette, App, Backbone, Swig, widgetContainerHtml)
    {
        "use strict"
        var _instanceId = 1;
        var WidgetContainerView = Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                events: {
                    'click a.button': 'buttonClicked'
                },
                template: Swig.compile(widgetContainerHtml),
                tagName: 'div',
                className: 'accordion-group widget',
                initialize: function (options)
                {
                    this.instanceId = _instanceId++;
                    this.model = new Backbone.Model({
                        title: _.result(options.widget, 'title'),
                        instance_id: this.instanceId
                    });
                    
                    this.widget = options.widget;
                    this.widgetManager = options.widgetManager;
                    this._super(options);
                    
                },
                onClose: function()
                {
                    this.widget.close();
                },
                onDomRefresh: function()
                {
                    this.widget.afterShow();
                },
                onRender: function ()
                {
                    var self = this;

                    // Custom button support later
                    var buttons = _.result(this.widget, 'buttons');
                    var $controlsContainer = self.$el.find('.widget-controls');
                    if (_.isArray(buttons))
                    {
                        _.each(buttons, function(buttonType)
                        {
                            $controlsContainer.append('<a href="#" data-action="' + buttonType + '" class="button"><i class="icon-' + buttonType + '"></i></a>');
                        })
                    }
                    $controlsContainer.append('<a href="#" data-action="remove" class="button"><i class="icon-remove"></i></a>');
                    this.widget.renderContent(function ($content)
                    {
                        self.$el.find('.accordion-inner').append($content);
                    });

                    this.$el.attr('widget-id', _.result(this.widget,'id'));
                    
                },

                // Private
                buttonClicked: function (e)
                {
                    var self = this;
                    var action = $(e.currentTarget).attr('action');
                    if (action == 'remove')
                    {
                        if (!(_.result(this.widget, 'beforeClose') === false))
                            setTimeout(function()
                            {
                                self.widgetManager.close(_.result(self.widget,'id'));
                            },0)
                    }
                    else
                    {
                        this.widget.onButton && this.widget.onButton(action);
                    }
                    // PreVent collapse toggle
                    return false;
                }

            })

        return WidgetContainerView;
    }
)