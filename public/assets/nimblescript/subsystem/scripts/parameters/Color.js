define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './ParameterBase', 'text!./color.html', 'bootstrap-colorpicker', './ParameterViewBase'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ParameterBase, html, $colorpicker,ParameterViewBase)
    {
        "use strict"

        var FORMATS = [
            { label: 'RGB - rgb(r,g,b)', val: 'rgb' },
            { label: 'RGBA - rgb(r,g,b,a)', val: 'rgba' },
            { label: 'HSL - hsl(h,s,l)', val: 'hsl' },
            { label: 'HSLA - hsl(h,s,l,a)', val: 'hsla' },
            { label: 'HEX - #123456', val: 'hex' }
        ]

        var ColorView = ParameterViewBase.extend(
            {
                template: Swig.compile(html),
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
                    var $color = this.$el.children('.color');
                    $color.colorpicker();
                    var self = this;
                    $color.children('input').on('change', function (e)
                    {
                        $color.data('color', $(eVent.target).val());
                        $color.colorpicker('update');
                    });
                }
            });

        var ColorParameter = ParameterBase.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    ParameterBase.prototype.constructor.apply(this, arguments);
                    this.addCustomSettings();
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
                        type: 'setting', base: 'select', key: 'format', label: 'Format',
                        options: FORMATS
                    }
                ],
                defaultValues: { format: 'hex' },
                parameterView: ColorView
            });

        return ColorParameter;

    }
)
