define(['marionette', 'backbone', 'underscore', 'swig', 'Vent', 'jquery', 'App', 'extendable/FormItemView',
    'text!./firsttime.html', 'text!content/license.html', 'text!content/formerror.html'],
    function (Marionette, Backbone, _, Swig, Vent, $, App, FormItemView, firstTimeHtml, licenseHtml, formErrorHtml)
    {
        "use strict";
        return FormItemView.extend({
            formTemplate: Swig.compile(firstTimeHtml),
            template: Swig.compile(''),
            className: 'firstime-form',
            events:
                {
                    'submit form': 'submit'
                },
            schema: {
                password: {
                    type: 'Password', title: 'Password', key: 'password', validators: ['required',
                    { type: 'match', field: 'confirmpassword', message: 'Passwords must match!' }], attachToParent: true
                },
                confirmpassword: {
                    type: 'Password', title: 'Confirm Password', key: 'confirmpassword', attachToParent: true,
                    validators: ['required']
                },
                agreetolicense: {
                    type: 'Checkbox', title: 'Agree to License', key: 'agreetolicense', attachToParent: true,
                    validators: ['required']
                }


            },
            onRender: function ()
            {
                this._super();
                this.$el.find('#license').html(licenseHtml);
                this.$el.find('[data-i18n]').i18n();
            },
            submit: function ()
            {
                var self = this;
                var userManager = App.request('user:getmanager');
                var errors = this.validate();
                if (!errors)
                {
                    userManager.firstTime(self.form.getValue(), function (err, response)
                    {
                        if (err || response.messages)
                        {
                            var v = new Marionette.ItemView({
                                template: Swig.compile(formErrorHtml),
                                model: new Backbone.Model({
                                    errors: _.map(data.messages, function (v)
                                    {
                                        return { message: v }
                                    }
                                    )
                                })
                            }).render();
                            self.$el.find('.error-block').append(v.$el);
                        }
                        else
                            userManager.signIn(self.form.getValue()['password']);
                    });

                    return false;

                }
                return false;
            }
        })
    }
)