
define(['require', 'backbone', 'jquery', 'underscore', 'Vent', 'App', 'logger', './SettingsManager'],
    function (require, Backbone, $, _, Vent, App, Logger, Settings)
    {
        "use strict"

        function UserManager()
        {

        }

        _.extend(UserManager.prototype, Backbone.Events,
            {
                firstTime: function(data, callback)
                {
                    App.serverCommand({
                        url: '/user/firsttime',
                        data: data,
                        type: 'POST',
                        success: function (data)
                        {
                            callback && callback(null, data);
                        },
                        error: function ()
                        {
                            callback && callback(arguments)
                        }
                    });

                },
                signOut: function (callback)
                {
                    App.serverCommand({
                        url: '/user/signout',
                        type: 'POST',
                        success: function (data)
                        {

                            callback && callback("success", data);
                        },
                        error: function ()
                        {
                            callback && callback("error", arguments);
                        }
                    })

                },
                signIn: function (password, callback)
                {
                    var self = this;
                    return App.serverCommand({
                        url: '/user/signin',
                        data: { password: password },
                        type: 'POST',
                        success: function (response)
                        {
                            if (response.success)
                                self.trigger('signedin');
                            callback && callback(!response.success && response.messages.join(';'), response);
                        },
                        error: function ()
                        {
                            callback && callback(arguments);
                        }
                    })

                },
                isFirstTime: function (callback)
                {
                    App.serverCommand({
                        url: '/user/isfirsttime',
                        success: function (data, textStatus, jqXHR)
                        {
                            callback && callback(data.first_time);
                        }
                    });

                },
                isSignedIn: function (callback)
                {
                    App.serverCommand({
                        url: '/user/current',
                        success: function (data)
                        {
                            callback && callback(data.authenticated);
                        }
                    });

                },
                showSignIn: function ()
                {
                    require(['./SigninView'], function (SigninView)
                    {
                        App.execute('app:showview', new SigninView());
                    });

                }
            })

        var userManager = new UserManager();

        App.reqres.setHandler('user:getmanager', function ()
        {
            return userManager;
        })


        return userManager;
    });