define(['marionette', 'backbone', 'underscore', 'Vent', 'backbone-forms', 'backbone-forms-bootstrap', 'helpers/FormBuilder'],
    function (Marionette, Backbone, _, Vent, BackboneForms, BackbonesFormsBootstrap, FormBuilder)
    {
        return Marionette.ItemView.extend({
            events:
                {
                },
            validate: function(callback)
            {

            },
            save: function (callback)
            {
                if (errors = this.form.validate())
                {
                    this.$el.find('.error-block').empty().append(this.form.buildErrorAlert(errors).$el);
                    var firstErrorKey = _.keys(errors)[0];
                    var firstErrorField = _.find(this.form.fields, function (k) { return k.key == firstErrorKey});
                    firstErrorField.editor.el.focus();
                    return callback('validationerror', errors);
                }

                this.form.commit();
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
            },
            onRender: function ()
            {
                var template = _.isFunction(this.formTemplate) ? this.formTemplate() : $(this.formTemplate).html();
                this.form = new FormBuilder({
                    template: template,
                    schema: this.schema
                }).render(this.model);
                this.$el.append(this.form.el);

            },
            sync: function (method, model, options)
            {
                Backbone.sync.apply(method, model, options);
            }
        });
    });
