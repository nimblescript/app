define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./parameter.html'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, parameterHtml)
    {
        "use strict"
        // TODO: Remove dependency on backbone forms editor fields etc
        return Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(parameterHtml),
                className: 'control-group',
                initialize: function()
                {
                    
                },
                ui: {

                },
                onRender: function()
                {
                    var typeWrapper = this.model.get('typeWrapper');
                    this._editorView = typeWrapper.render();
                    this.$el.find('.parameter-editor').replaceWith(this._editorView.$el);
                    var self = this;
                    var errorDisplays = [];
                    _.each(this._editorView.editorFields, function (editorField)
                    {
                        editorField.$el = self.$el;
                        if (editorField.$error)
                            self.$el.find('.parameter-error').append(editorField.$error);
                    });
                    this.$el.attr('data-param-id', this.model.get('id')).attr('data-param-type', this.model.get('param-type'));
                },
                onShow: function()
                {
                    _.result(this._editorView, 'onShow');
                },
                validate: function ()
                {
                    var errors = {};
                    _.each(this._editorView.editorFields, function (editorField)
                    {
                        _.extend(errors, editorField.validate());
                    })
                    return errors;
                },
                setValue: function(value)
                {
                    this._editorView.setValue(value);
                },
                setError: function(error)
                {
                    this.$el.toggleClass('error', !!error);
                    if (error)
                        this._editorView.editorFields[0].$error.text(error);
                },
                getValue: function ()
                {
                    return this._editorView.getValue();
                },
                reset: function ()
                {
                    this.$el.removeClass('error');
                    _.result(this._editorView, 'reset');
                }
            });

        
    }
)
