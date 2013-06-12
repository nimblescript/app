define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './ParameterBase', 'text!./selection.html', './Validators',
    'select2/select2', './ParameterViewBase'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ParameterBase, html, Validators, $select2,ParameterViewBase)
    {
        "use strict"

        var SelectionView = ParameterViewBase.extend(
        {
            template: Swig.compile(html),
            onRender: function ()
            {
                var validators = [];
                if (this.model.get('required'))
                    validators.push('required');
                var lengthRange = this.model.get('lengthRange') || [null,null];
                validators.push(Validators.createSelectValidator(this.model.get('required'),
                    lengthRange[0], lengthRange[1]));

                var schema = {
                    key: this.model.get('id'), type: 'Select',
                    validators: validators, options: this.model.get('options')
                };
                if (this.model.get('size') == 'multiple' || parseInt(lengthRange[0]) > 1 || parseInt(lengthRange[1]) > 1)
                {
                    schema.editorAttrs = { multiple: 'multiple' };
                    schema.editorClass = 'input-xlarge';
                }


                var field = this.options.formBuilder.createField({
                    schema: schema, 
                    value: this.model.get('initialValue'), $container: this.$el
                });
                field.editor.$el.select2({maximumSelectionSize: lengthRange[1], width: 'off'});
                this.editorFields = [field];
            },
            getValue: function(value)
            {
                return this.editorFields[0].editor.$el.select2('val');
            },
            setValue: function (value)
            {
                this.editorFields[0].editor.$el.select2('val', value);
            },
            reset: function ()
            {
                this.setValue(this.model.get('initialValue'));
            }

        });

        var SelectionParameter = ParameterBase.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    ParameterBase.prototype.constructor.apply(this, arguments);
                },
                settings: ['size', 'lengthRange', 'options', 'initialValue'],
                settingsLayout: [
                    { type: 'setting', base: 'text', key: 'description', label: 'Description', className: 'input-xlarge' },
                    { type: 'html', html: '<div style="margin-bottom: 10px;" class="clearfix"></div>' },
                    { type: 'setting', base: 'checkbox', key: 'size', label: 'Multiple Selection', truevalue: 'multiple', falsevalue: 'single' },
                    { type: 'html', html: '<div style="margin-bottom: 10px;" class="clearfix"></div>' },
                    {
                        type: 'setting', base: 'range', key: 'lengthRange', min: { label: 'Min # choices', minvalue: 0, allownull: true },
                        max: { label: 'Max # choices', allownull: true }, integeronly: true, className: 'input-small'
                    },
                    { type: 'html', html: '<div style="margin-bottom: 10px;" class="clearfix"></div>' },
                    { type: 'setting', base: 'options', key: 'options', label: 'Options', fieldset: true, fieldsetlabel: 'Options' }
                ],
                defaultValues: {
                    options: []
                },
                parameterView: SelectionView,
                updateSettingsModel: function ()
                {
                    this._super();
                    this.model.set('initialValue', this._settingsView.form.fields['options'].editor.$el.val());
                }
            });

        return SelectionParameter;

    }
)
