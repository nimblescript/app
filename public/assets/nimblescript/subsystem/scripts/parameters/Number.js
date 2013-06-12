define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './ParameterBase', 'text!./number.html', './Validators', './ParameterViewBase'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ParameterBase,html,Validators,ParameterViewBase)
    {
        "use strict"

        var NumberView = ParameterViewBase.extend(
            {
                template: Swig.compile(html),
                className: 'parameter',
                onRender: function ()
                {
                    var validators = [];
                    if (this.model.get('required'))
                        validators.push('required');

                    var numberRange = this.model.get('numberRange') || ['',''];
                    validators.push(Validators.createNumberValidator(this.model.get('required'),
                        this.model.get('integerOnly'), numberRange[0], numberRange[1]));

                    var field = this.options.formBuilder.createField({
                        schema: {
                            key: this.model.get('id'), type: 'Text',
                            validators: validators
                        },
                        value: this.model.get('initialValue'), $container: this.$el
                    });
                    this.editorFields = [field];
                }
            });

        var NumberParameter = ParameterBase.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    ParameterBase.prototype.constructor.apply(this, arguments);
                },
                settings: ['initialValue', 'integerOnly','numberRange'],
                settingsLayout: [
                    { type: 'setting', base: 'text', key: 'description', label: 'Description', className: 'input-xlarge' },
                    { type: 'setting', base: 'text', key: 'initialValue', label: 'Initial Value' },
                    { type: 'setting', base: 'checkbox', key: 'integerOnly', label: 'Integers Only' },
                    { type: 'html', html: '<div style="margin-bottom: 10px;" class="clearfix"></div>' },
                    {
                        type: 'setting', base: 'range', key: 'numberRange', className: 'input-small', min: { label: 'Min', minvalue: 0, allownull: true },
                        max: { label: 'Max', allownull: true }, integeronly: true, fieldset: true, fieldsetlabel: 'Number'
                    },
                ],
                parameterView: NumberView
            });
            
        return NumberParameter;

    }
)
