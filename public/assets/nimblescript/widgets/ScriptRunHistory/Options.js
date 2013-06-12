define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger','modalhelper', 'text!./options.html'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ModalHelper, optionsHtml)
    {
        "use strict"

        var OptionsView = Marionette.ItemView.extend(
            {
                template: Swig.compile(optionsHtml),
                tagName: 'div',
                events:
                    {
                    },
                onRender: function ()
                {
                },
                customTrigger: function (parentType, eVentName)
                {
                    var args = Array.prototype.slice.call(arguments, 2);
                    this.trigger.apply(this, [parentType, eVentName].concat(args));
                    this.trigger.apply(this, [parentType + ':' + eVentName].concat(args));
                }
            });

        function OptionsModal(options)
        {
            this.options = options || {};
        }

        _.extend(OptionsModal.prototype, Backbone.Events, {
            show: function ()
            {
                var self = this;
                App.execute('settings:get', function (settings)
                {
                    var view = new OptionsView({ model: new Backbone.Model({ atStartup: settings.startup.atStartup }) });
                    var modalHelper = new ModalHelper();
                    modalHelper.view({
                        view: view, width: 200, height: 100,
                        title: 'Welcome to nimbleScript',
                        onButton: function (text)
                        {
                            switch (text)
                            {
                                case "OK":
                                    App.execute('settings:get', function (settings)
                                    {
                                        settings.startup.atStartup = view.ui.atStartup.val();
                                        App.execute('settings:save', settings);
                                    })

                            }
                        }
                    });

                })

            }
        });

        return OptionsModal;

    }
)
