define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './ParameterBase', 'text!./date.html', 'bootstrap-datepicker', './ParameterViewBase'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ParameterBase, html, $datepicker,ParameterViewBase)
    {
        "use strict"

        var DateView = ParameterViewBase.extend(
            {
                template: Swig.compile(html),
                className: 'parameter',
                onRender: function ()
                {
                    var validators = [];
                    if (this.model.get('required'))
                        validators.push('required');

                    var field = this.options.formBuilder.createField({
                        schema: {
                            key: this.model.get('id'), type: 'Text',
                            validators: validators
                        },
                        value: this.model.get('initialValue'), $container: this.$el
                    });
                    this.editorFields = [field];
                    this.$el.children('.date').datepicker({ autoclose: true });
                }
            });


        var DateParameter = ParameterBase.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    ParameterBase.prototype.constructor.apply(this, arguments);
                },
                settings: ['initialValue', 'format'],
                settingsLayout: [
                    { type: 'setting', base: 'text', key: 'description', label: 'Description', className: 'input-xlarge' },
                    {
                        type: 'setting', base: 'text', key: 'initialValue', label: 'Initial Value',
                        extraValidators: [function (value, formValues)
                        {
                        }]
                    },
                    {
                        type: 'setting', base: 'text', key: 'format', label: 'Format'
                    }
                ],
                defaultValues: { format: 'dd-mm-yyyy' },
                parameterView: DateView
            });

        return DateParameter;

    }
)
