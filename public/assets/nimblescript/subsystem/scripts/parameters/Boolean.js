define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './ParameterBase', 'text!./boolean.html','./ParameterViewBase'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ParameterBase, html,ParameterViewBase)
    {
        "use strict"

        var BooleanView = ParameterViewBase.extend(
            {
                template: Swig.compile(html),
                onRender: function ()
                {
                    var validators = [];
                    if (this.model.get('required'))
                        validators.push('required');

                    var field = this.options.formBuilder.createField({
                        schema: {
                            key: this.model.get('id'), type: 'Checkbox',
                            validators: validators
                        },
                        value: this.model.get('initialValue'), $container: this.$el
                    });
                    this.editorFields = [field];
                },
                getValue: function (value)
                {
                    return this.editorFields[0].editor.$el.prop('checked');
                },
                setValue: function (value)
                {
                    this.editorFields[0].editor.$el.prop('checked', value);
                },
                reset: function ()
                {
                    this.editorFields[0].editor.$el.prop('checked',this.model.get('initialValue'));
                }
            });


        var BooleanParameter = ParameterBase.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    ParameterBase.prototype.constructor.apply(this, arguments);
                    this.addCustomSettings();

                },
                settings: ['initialValue'],
                settingsLayout: [
                    { type: 'setting', base: 'text', key: 'description', label: 'Description', className: 'input-xlarge' },
                    { type: 'setting', base: 'checkbox', key: 'initialValue', label: 'Initial Value', truevalue: true, falsevalue: false }
                ],
                parameterView: BooleanView
            });
            
        return BooleanParameter;

    }
)
