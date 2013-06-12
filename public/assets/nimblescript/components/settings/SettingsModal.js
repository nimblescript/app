define(['require', 'underscore', 'App', 'backbone', 'modalhelper', './SettingsView'],
    function (require, _, App, Backbone, ModalHelper, SettingsView)
    {
        function SettingsModal(options)
        {
            this.options = options || {};
        }
        _.extend(SettingsModal.prototype, Backbone.Events, {
            show: function (options)
            {
                var self = this;
                App.execute(['settings:get', 'modules:installed'], function (result)
                {
                    var settings = result[0], modules = result[1];
                    var view = new SettingsView({
                        model: new Backbone.Model({
                            settings: settings,
                            modules: modules,
                            sections: App.request('settings:getmanager').getSections()
                        })
                        , initialSection: self.options.initialSection
                    });
                    var $modal;
                    var doCancelCheck = true;
                    var modalHelper = new ModalHelper();
                    var modal = modalHelper.view({
                        view: view, height: 500, width: 800, title: 'Settings',
                        onButton: function (text)
                        {
                            switch (text)
                            {
                                case "OK":
                                    save();
                                    break;
                                case "Cancel":
                                case "X":
                                    cancel();
                                    break;
                            }
                            return false;
                        },
                        onCreate: function ($m)
                        {
                            $modal = $m;
                            /*
                            $modal.on('hide', function (e)
                            {
                                if (doCancelCheck)
                                {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    cancel()
                                    return false;
                                }
                                view.close();
                            });
                            */
                        }
                    });

                    /* Save settings */
                    function save()
                    {
                        view.saveSettings(function (err)
                        {
                            if (err)
                                new ModalHelper().alert({ title: 'Unable to save...', text: err })
                            else
                                close();

                        });
                    }

                    /* Cancel, prompt if settings changed */
                    function cancel()
                    {
                        if (view.isDirty())
                        {
                            var modal = new ModalHelper().alert({
                                text: 'Settings have changed - close without saving?',
                                buttons: [{ text: 'OK', isDefault: true }, { text: 'Cancel' }],
                                onButton: function (id)
                                {
                                    if (id == 'OK')
                                    {
                                        // Allow Alert to close first
                                        setTimeout(function () { close() }, 0);
                                        
                                    }
                                    return true;
                                }
                            });
                        }
                        else
                            close();
                    }

                    /* Close modal  */
                    function close()
                    {
                        doCancelCheck = false;
                        view.close();
                        modalHelper.close();
                    }
                });
            }
        })

        return SettingsModal;

    }

   );
