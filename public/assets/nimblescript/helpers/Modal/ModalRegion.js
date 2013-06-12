define(['underscore', 'jquery', 'marionette', 'backbone', 'Vent', 'bootstrap-modal'],
    function (_,$,Marionette, Backbone, Vent, BootstrapModal )
    {
        var ModalRegion = Marionette.Region.extend({
            el: "#modal",
            constructor: function ()
            {
                _.bindAll(this);
                Marionette.Region.prototype.constructor.apply(this, arguments);
            },
            onShow: function()
            {
                this._showModal(this);
            },
            getEl: function (selector)
            {
                var $el = $(selector);
                this.on("close", this.hideModal, this);
                return $el;
            },
            showModal: function(view, options)
            {
                this.options = options;
                this.show(view);
            },
            _showModal: function (view)
            {
                var self = this;
                this.$el.find('.modal').on('shown', function (e)
                {
                    self.trigger('shown');
                });
                this.$el.find('.modal').on('hidden', this.close);
                var opts = _.extend({}, { keyboard: true }, this.options);
                this.$el.find('.modal').modal(opts);
                var modal = $('.modal.in');
            },

            hideModal: function ()
            {
                this.$el.find('.modal').modal('hide');
            }
        });
        return ModalRegion;
    });
