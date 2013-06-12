define(['require', 'marionette', 'jquery', 'underscore', 'Vent', 'App', 'logger', 'widget'],
    function (require, Marionette, $, _, Vent, App, Logger,Widget)
    {
        "use strict"

        var ScriptRunHistoryWidget = Widget.extend(
            {
                constructor: function()
                {
                    Widget.prototype.constructor.apply(this,arguments)
                },
                id: 'xemware.nimblescript.widget.scriptrunhistory',
                title: 'Script Run History',
                init: function()
                {
                    this._super.apply(this, arguments);
                },
                renderContent: function (callback)
                {
                    var self = this;
                    App.execute('components:get', ['xemware.nimblescript.component.scriptrunhistory'], function (err, Components)
                    {
                        self.view = Components[0].createView();
                        var $el = self.view.render().$el;
                        callback($el);
                    });
                }
            })

        return ScriptRunHistoryWidget;

    }
)