define(['marionette', 'backbone', 'underscore', 'swig', 'Vent', 'jquery', 'App','text!./itemdetails.html','rateit'],
    function (Marionette, Backbone, _, Swig, Vent, $, App,html, $rateit)
    {
        "use strict";
        return Marionette.ItemView.extend({
            constructor: function()
            {
                _.bindAll(this);
                Marionette.ItemView.prototype.constructor.apply(this, arguments);
            },
            template: Swig.compile(html),
            className: 'item-details',
            modelEvents:
                {
                    'change:item': 'render'
                },
            events: {
                'click a.edit-settings': 'editSettings'
            },
            onRender: function ()
            {
                this.$el.find('.rateit').rateit();
            },
            editSettings: function ()
            {
                var settingsManager = App.request('settings:getmanager');
                settingsManager.showModal({ initialSection: 'scriptexecution' });
            },
            modulesToAction: function ()
            {
                var m = {};
                this.$el.find('input[data-module-id]:checked').each(function ()
                {
                    m[$(this).attr('data-module-id')] = {
                        action: $(this).attr('data-action'),
                        install_code: $(this).attr('data-install-code'),
                        platform: $(this).attr('data-platform')
                    }
                });
                return m;
            }
        })
    }
)