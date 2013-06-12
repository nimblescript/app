/*
  FormBuilder - enhance PowerMedia backbone-forms

  Copyright (c) 2013 Tim Shnaider
  Licensed under the MIT license.
  Portions from various projects
  * https://github.com/powmedia/backbone-forms


*/
define(['jquery', 'underscore', 'marionette', 'backbone', 'swig', 'backbone-forms', 'backbone-forms-bootstrap', 'bootstrap-datepicker',
    'cleditor', 'text!content/formerror.html', './BackboneFormExtensions'],
    function($,_, Marionette, Backbone, Swig, BackboneForms, BackboneFormsBootstrap, $datepicker,$cleditor, formErrorHtml )
    {

        function FormBuilder(options)
        {
            _.extend(this, options || {});
            if (this.template )
                this.compiledTemplate = compileTemplate(this.template);
        }

        compileTemplate = function (str)
        {
            //Store user's template options
            var _interpolateBackup = _.templateSettings.interpolate;

            //Set custom template settings
            _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

            var template = _.template(str);

            //Reset to users' template settings
            _.templateSettings.interpolate = _interpolateBackup;

            return template;
        }

        function buildErrorAlert(errors)
        {
            var self = this;
            _.each(_.keys(errors), function(v)
            {
                errors[v].schema = _.find(self.schema, function (s) { return v == s.key });
                errors[v].title = errors[v].schema.title;
            });
            return new Marionette.ItemView({
                template: Swig.compile(formErrorHtml),
                model: new Backbone.Model({ errors: errors })
            }).render();
        }

        _.extend(FormBuilder.prototype,
            {
                createField: function (options)
                {
                    var opts = _.defaults({}, options, { value: null, model: null, key: null, schema: {}, form: null, $container: null,attachToParent: true });

                    var field = new BackboneForms.Field(_.extend({},{ key: opts.schema.key },_.pick(opts, 'schema','value','model','form'))).render();
                    if (opts.$container)
                    {
                        var f = opts.$container.find('span[data-field-key=' + opts.schema.key + '][data-type=field]');
                        f.replaceWith(field.editor.$el.addClass(f.attr('class')));
                        var e = opts.$container.find('span[data-field-key=' + opts.schema.key + '][data-type=error]');
                        e.replaceWith(field.$error.addClass(e.attr('class')));
                        var h = opts.$container.find('span[data-field-key=' + opts.schema.key + '][data-type=help]');
                        h.replaceWith(field.$help.addClass(h.attr('class')));
                        if (opts.attachToParent)
                        {
                            field.$el = opts.$container.find('[data-field-parent=' + opts.schema.key + ']');
                        }
                    }
                    return field;

                },
                render: function (model)
                {
                    var self = this;
                    var renderedFields = {};
                    var $form = _.result(this,'getEl') || $(this.template);
                    var backboneForm = new BackboneForms({
                        schema: this.schema,
                        model: model
                    }).render();

                    _.each(this.schema, function (schema)
                    {
                        var field = _.find(backboneForm.fields, { key: schema.key });
                        if (!field)
                            return;

                        var f = $form.find('span[data-field-key=' + schema.key + '][data-type=field]');
                        f.length && f.replaceWith(field.editor.$el.addClass(f.attr('class')));
                        var e = $form.find('span[data-field-key=' + schema.key + '][data-type=error]');
                        e.length && e.replaceWith(field.$error.addClass(e.attr('class')));
                        var h = $form.find('span[data-field-key=' + schema.key + '][data-type=help]');
                        h.replaceWith(field.$help.addClass(h.attr('class')));
                        if (schema.attachToParent)
                            field.$el = $form.find('[data-field-parent=' + schema.key + ']');

                    });
                    
                    backboneForm.setElement($form);
                    backboneForm.buildErrorAlert = buildErrorAlert;
                    _.bindAll(backboneForm, 'buildErrorAlert');
                    return backboneForm;
                }
            }
            );



        return FormBuilder;
});
