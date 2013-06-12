define(['marionette', 'backbone', 'Vent', 'underscore','backbone-forms', 'backbone-forms-bootstrap', 'helpers/FormBuilder'],
    function (Marionette, Backbone, Vent,  _,BackboneForms, BackbonesFormsBootstrap, FormBuilder)
    {
        return Marionette.ItemView.extend({
            showErrors: function(errors)
            {
                this.$el.find('.error-block').empty();
                if (errors) this.$el.find('.error-block').append(this.form.buildErrorAlert(errors).$el);
            },
            validate: function(focusFirst)
            {
                var errors = this.form.validate();
                var result = 'success';
                if (errors && focusFirst)
                {
                    var firstErrorKey = _.keys(errors)[0];
                    var firstErrorField = _.find(this.form.fields, function (k) { return k.key == firstErrorKey });
                    firstErrorField.editor.el.focus();
                    
                }
                this.showErrors(errors);
                return errors;
            },
            getValues: function()
            {
                return this.form.getValue();
            },
            save: function (callback)
            {
                var errors = this.form.validate();
                if (!errors)
                {
                    // Bug in changed calculations, @@TODO investigate
                    if (/* this.model.hasChanged() || this.model.isNew() */ true)
                    {
                        this.model.save(null, {
                            success: function ()
                            {
                                callback('success');
                            },
                            error: function ()
                            {
                                callback('failed', 'Some error saving')
                            }

                        })
                    }
                    else
                        callback('nochange');
                }
                else
                    callback('validationerror',errors)
            },
            onRender: function ()
            {
                this.form = new FormBuilder({
                    template: this.formTemplate && (_.isFunction(this.formTemplate) ? this.formTemplate() : $(this.formTemplate).html()),
                    getEl: this.formEl,
                    schema: this.schema
                }).render(this.model);
                this.$el.append(this.form.el);
            },
            onClose: function()
            {
                this.form.remove();

            }
        });
    });
