define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', './Parameter', 'extendable/FormItemView','helpers/FormBuilder',
    'text!./settingsview.html','./Validators'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, Parameter, FormItemView,FormBuilder, settingsHtml,Validators)
    {
        "use strict"


        var ParameterBase = Parameter.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Parameter.prototype.constructor.apply(this, arguments);
                    this.initialize();
                },
                initialize: function()
                {
                    this.addCustomSettings(_.result(this, 'settings'));
                },
                hasSettings: true,
                toObject: function ()
                {
                    var obj = {};
                    _.each(_.omit(this.model.attributes, 'typeWrapper','param-num','hassettings'), function (value, key)
                    {
                        obj[key] = value;
                    });
                    return obj;
                },
                settingsLayout: [
                    { type: 'setting', base: 'text', key: 'description', label: 'Description', required: true }
                ],
                settingsView: function ()
                {
                    this._settingsView = createSettingsView(_.result(this, 'settingsLayout'), this.model);
                    return this._settingsView;
                },
                saveSettings: function ()
                {
                    var self = this;
                    _.each(this._settingsView.form.fields, function (field)
                    {
                        field.editor.$el.popover('destroy');
                    });
                    var hasError = false;
                    this._settingsView.validate(function (errors)
                    {
                        if (errors)
                            hasError = true;
                        _.each(errors, function (error,fieldId)
                        {
                            var field = self._settingsView.form.fields[fieldId];
                            field.editor.$el.popover({ content: error.message, trigger: 'hover' });
                        });
                    });
                    if (!hasError)
                        this.updateSettingsModel();
                    return !hasError;
                },
                updateSettingsModel: function ()
                {
                    var self = this;
                    _.each(_.result(this, 'settingsLayout'), function (layoutItem)
                    {
                        switch (layoutItem.type)
                        {
                            case 'setting':
                                switch (layoutItem.base)
                                {
                                    case 'select':
                                    case 'text':
                                        self.model.set(layoutItem.key, self._settingsView.form.fields[layoutItem.key].editor.$el.val());
                                        break;
                                    case 'checkbox':
                                        var checked = self._settingsView.form.fields[layoutItem.key].editor.$el.prop('checked');
                                        self.model.set(layoutItem.key, checked ? (layoutItem.truevalue || true)
                                            : (layoutItem.falsevalue || false ));
                                        break;
                                    case 'range':
                                        var range = [self._settingsView.form.fields[layoutItem.key + '-min'].editor.$el.val(),
                                            self._settingsView.form.fields[layoutItem.key + '-max'].editor.$el.val()];
                                        self.model.set(layoutItem.key, range);
                                        break;
                                    case 'regex':
                                        self.model.set(layoutItem.key + 'Expression', self._settingsView.form.fields[layoutItem.key + '-expr'].editor.$el.val());
                                        self.model.set(layoutItem.key + 'NoMatchMessage', self._settingsView.form.fields[layoutItem.key + '-message'].editor.$el.val());
                                        break;
                                    case 'options':
                                        var $options = self._settingsView.form.fields[layoutItem.key].editor.$el.children('option');
                                        var options = [];
                                        $options.each(function (i, el)
                                        {
                                            var $el = $(el);
                                            options.push({ val: $el.val(), label: $el.text() });
                                        });
                                        self.model.set(layoutItem.key, options);
                                        break;

                                }

                        }
                    });
                },
                addCustomSettings: function (properties)
                {
                    var self = this;
                    _.each(properties, function(property)
                    {
                        var key = _.isString(property) ? property : _.result(property, 'key');
                        self[key] = function () { return self.model.get(key) };
                        self['set' + _.capitalize(key)] = function (value) { self.model.set(key, value) };

                    })
                },
                render: function ()
                {
                    var formBuilder = new FormBuilder();
                    if (!this._editorView)
                    {
                        this._viewModel = this.model.clone();
                        var ParameterView = this.parameterView;
                        this._editorView = new ParameterView({
                            model: this._viewModel, formBuilder: formBuilder
                        });
                        this._editorView.render();
                    }
                    return this._editorView;
                },
                validate: function()
                {
                }
            });

        

        function formFieldCreator(key, type, model, validators)
        {
            return new BackboneForms.Field({ key: key, schema: { type: type, key: key, validators: validators}, model: model} ).render();
        }

        function createSettingsView(layout,model)
        {
            var schema = {}, initialValues = {};
            var $el = $(Swig.compile(settingsHtml)(model.attributes));
            var $container = $el.find('.settings');
            _.each(layout, function (layoutItem)
            {
                switch (layoutItem.type)
                {
                    case 'setting':
                        var ret = createSetting(layoutItem,model);
                        _.extend(schema, ret.schema);
                        _.extend(initialValues, ret.initialValues);
                        $container.append(ret.$el)
                        break;
                    case 'html':
                        $container.append($(layoutItem.html));
                        break;

                }
            });
            var SettingsView = FormItemView.extend({
                events: {
                    'click button[data-action=option-add]': 'addOption',
                    'click button[data-action=option-up],button[action=option-down]': 'moveOption',
                    'click button[data-action=option-remove]': 'removeOption',
                    'submit *': function(e) { 
                        this.trigger('submit',e)
                    }
                },
                formEl: $el,
                template: Swig.compile(''),
                schema: schema,
                className: 'parameter-settings',
                addOption: function (e)
                {
                    var key = $(e.currentTarget).attr('data-field-key');
                    var value = this.$el.find('[name=' + key + '-val]').val();
                    var label = this.$el.find('[name=' + key + '-label]').val();
                    var $select = this.$el.find('[name=' + key + ']');
                    $select.addSelectOption(label, value);
                },
                removeOption: function (e)
                {
                    var key = $(e.currentTarget).attr('data-field-key');
                    var $select = this.$el.find('[name=' + key + ']');   
                    $select.children('option:selected').remove();   
                },
                moveOption: function (e)
                {
                    var key = $(e.currentTarget).attr('data-field-key');
                    var action = $(e.currentTarget).attr('data-action');
                    var $select =this.$el.find('select[name=' + key + ']');
                    var $firstSelectedOption = $select.children('option:selected').first();
                    var optionIndex = $firstSelectedOption.index();
                    switch (action)
                    {
                        case 'option-up':
                            if (optionIndex > 0)
                                $select.children('option').eq(optionIndex - 1).before($firstSelectedOption);
                            break;
                        case 'option-down':
                            if (optionIndex < ($select.children().length - 1) )
                                $select.children('option').eq(optionIndex + 1).after($firstSelectedOption);
                            break;
                    }
                }
            });

            var formModel = new Backbone.Model(initialValues);

            var view = new SettingsView({ model: formModel });
            return view;
        }

        function createSetting(item, model)
        {
            var $el = $('<div></div>');
            var $container = $el;
            var schema = {}, initialValues = {};
            if (item.fieldset)
            {
                $el.append($('<div class="fieldset-wrapper"><div class="fieldset"><div class="fieldset-legend"></div><div class="fieldset-content form-inline"></div></div></div>'));
                $el.find('.fieldset-legend').text(item.fieldsetlabel);
                $container = $el.find('.fieldset-content');
            }
            
            switch (item.base)
            {
                case 'select':
                    $container.append(createLabelField(item.key, item.className, item.label));
                    initialValues[item.key] = model.get(item.key);
                    schema[item.key] = createSchemaItem('Select',
                        item.key, item.label, true, item.required);
                    schema[item.key].options = item.options;
                    break;
                case 'text':
                    $container.append(createLabelField(item.key, item.className, item.label));
                    schema[item.key] = createSchemaItem(item.multiline ? 'TextArea' : 'Text',
                        item.key, item.label, true, item.required);
                    initialValues[item.key] = model.get(item.key);
                    break;
                case 'checkbox':
                    $container.append(createLabelField(item.key, item.className, item.label).addClass('checkedbox'));
                    schema[item.key] = createSchemaItem('Checkbox',
                        item.key, item.label, true, item.required);
                    initialValues[item.key] = _.contains([item.truevalue || true,true], model.get(item.key));
                    break;
                case 'range':
                    $container.append(createLabelField(item.key + '-min', item.className, item.min.label));
                    $container.append(createLabelField(item.key + '-max', item.className, item.max.label));
                    schema[item.key + '-min'] = createSchemaItem('Text',
                        item.key + '-min', 'Min', true, item.required);
                    schema[item.key + '-min'].validators.push(Validators.createNumberValidator(item.min.allownull, item.integeronly, item.min.minvalue, item.min.maxvalue));
                    schema[item.key + '-max'] = createSchemaItem('Text',
                        item.key + '-max', 'Max', true, item.required);
                    schema[item.key + '-max'].validators.push(Validators.createNumberValidator(item.max.allownull, item.integeronly, item.max.minvalue, item.max.maxvalue));
                    var rangeValue = model.get(item.key) || [];
                    initialValues[item.key + '-min'] = rangeValue[0];
                    initialValues[item.key + '-max'] = rangeValue[1];
                    break;
                case 'regex':
                    $container.append(createLabelField(item.key + '-expr', item.className, item.exprlabel));
                    $container.append(createLabelField(item.key + '-message', item.className, item.messagelabel));
                    schema[item.key + '-expr'] = createSchemaItem('Text',
                        item.key + '-expr', 'Expression', true, item.required);
                    schema[item.key + '-expr'].validators.push(Validators.regexValidator);
                    
                    schema[item.key + '-message'] = createSchemaItem('Text',
                        item.key + '-message', 'Message', true, item.required);
                    initialValues[item.key + '-expr'] = model.get(item.key + 'Expression');
                    initialValues[item.key + '-message'] = model.get(item.key + 'NoMatchMessage');
                    break;
                case 'options':
                    $container.append(createLabelField(item.key, item.className, item.label));
                    $container.append('<button type="button" class="btn btn-mini" data-action="option-up" data-field-key="' + item.key + '"><i class="icon-arrow-up"><i></button>');
                    $container.append('<button type="button" class="btn btn-mini" data-action="option-down" data-field-key="' + item.key + '"><i class="icon-arrow-down"><i></button>');
                    $container.append('<button type="button" class="btn" data-action="option-remove" data-field-key="' + item.key + '">Remove</button>');
                    $container.append('<div style="margin-bottom: 10px;" class="clearfix"></div>');
                    $container.append(createLabelField(item.key + '-label', 'input-small', 'Label'));
                    $container.append(createLabelField(item.key + '-val', 'input-small', 'Value'));
                    $container.append('<button type="button" class="btn" data-action="option-add" data-field-key="' + item.key + '">Add</button>');
                    
                    schema[item.key] = createSchemaItem('Select',
                        item.key, item.label, true);
                    schema[item.key].options = model.get('options');
                    schema[item.key].editorAttrs = { multiple: 'multiple' };

                    schema[item.key+'-val'] = createSchemaItem('Text',
                        item.key+'-val', item.label, true);
                    schema[item.key + '-label'] = createSchemaItem('Text',
                        item.key + '-label', item.label, true);
                    initialValues[item.key] = model.get('initialValue');
                    break;
            }

            if (_.isArray(item.extraValidators))
            {
                _.each(schema, function (schemaItem)
                {
                    schemaItem.validators.push.apply(schemaItem.validators, item.extraValidators);
                });
            }
            return { $el: $($el.html()), schema: schema, initialValues: initialValues  };

        }

        function createLabelField(key, className, label)
        {
            var $span = $('<span></span>').attr('data-field-key', key).attr('data-type', 'field').addClass(className);
            var $label = $('<label></label').attr('data-field-parent', key).append(label + ':').append($span);
            return $label;
        }

        function createSchemaItem(type, key, title, attachToParent, required)
        {
            var schema = { type: type, key: key, title: title, attachToParent: attachToParent, validators: [] };
            if (required)
                schema.validators.push('required');
            return schema;
        }

        return ParameterBase;
    }
)
