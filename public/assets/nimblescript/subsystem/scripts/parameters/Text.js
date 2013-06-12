define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './ParameterBase', 'text!./text.html',
    './Validators', './ParameterViewBase'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ParameterBase, html,Validators,ParameterViewBase)
    {
        "use strict"

        var TextView = ParameterViewBase.extend(
            {
                template: Swig.compile(html),
                className: 'parameter',
                onRender: function ()
                {
                    var validators = [];
                    if (this.model.get('required'))
                        validators.push('required');
                    if (this.model.get('lengthRange'))
                    {
                        var lengthRange = this.model.get('lengthRange');
                        validators.push(Validators.createLengthValidator(this.model.get('required'), 
                            lengthRange[0], lengthRange[1]));
                    }
                    if (this.model.get('regexExpression'))
                    {
                        validators.push(Validators.createRegexValidator(this.model.get('regexExpression'), this.model.get('regexNoMatchMessage')));
                    }

                    var field = this.options.formBuilder.createField({
                        schema: {key: this.model.get('id'), type: this.model.get('size') == 'single' ? 'Text' : 'TextArea',
                            validators: validators},
                        value: this.model.get('initialValue'), $container: this.$el});
                    this.editorFields = [field];
                },
                reset: function ()
                {
                    this.editorFields[0].editor.$el.val(this.model.get('initialValue'));
                }
            });

        var TextParameter = ParameterBase.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    ParameterBase.prototype.constructor.apply(this, arguments);
                },
                settings: ['initialValue', 'size', 'lengthRange', 'regexExpression', 'regexNoMatchMessage'],
                settingsLayout: [
                    { type: 'setting', base: 'text', key: 'description', label: 'Description', className: 'input-xlarge' },
                    { type: 'setting', base: 'text', key: 'initialValue', label: 'Initial Value', className: 'input-xlarge' },
                    { type: 'setting', base: 'checkbox', key: 'size', label: 'Multiline', truevalue: 'multiple', falsevalue: 'single' },
                    { type: 'html', html: '<div style="margin-bottom: 10px;"></div>' },
                    {
                        type: 'setting', base: 'range', key: 'lengthRange', min: { label: 'Min Len', minvalue: 0, allownull: true },
                        max: { label: 'Max Len', allownull: true }, integeronly: true, fieldset: true, fieldsetlabel: 'Length', className: 'input-small'
                    },
                    { type: 'setting', base: 'regex', key: 'regex', fieldset: true, fieldsetlabel: 'Regular Expression', className: 'input-xlarge', exprlabel: 'Expression', messagelabel: 'No match message' }
                ],
                parameterView: TextView
            });

        return TextParameter;

    }
)
