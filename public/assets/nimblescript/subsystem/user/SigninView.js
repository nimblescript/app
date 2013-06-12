define(['require', 'jquery', 'underscore', 'Vent', 'swig', 'marionette', 'App', 'logger', 'text!./signin.html'],
    function (require, $, _, Vent, Swig, Marionette, App, Logger,signinHtml)
    {
        "use strict"
        return Marionette.ItemView.extend({
            template: Swig.compile(signinHtml),
            ui:
                {
                    password: 'input',
                    alert: 'div.alert', 
                    errorMessage: '.error-message'
                },
            events:
                {
                    "click button.btn": 'doSignin',
                    'submit form': 'doSignin'
                },
            doSignin: function (e)
            {
                e.preventDefault();
                e.stopPropagation();
                var self = this;
                var password = this.ui.password.val();
                var userManager = App.request('user:getmanager');
                userManager.signIn(password, function (err, response)
                {
                    if (err)
                    {
                        self.ui.alert.css('display', 'block');
                        self.ui.errorMessage.html(err);
                    }
                });

                return false;
            },
            onDomRefresh: function()
            {
                this.ui.password.focus();
            }

        });


    });