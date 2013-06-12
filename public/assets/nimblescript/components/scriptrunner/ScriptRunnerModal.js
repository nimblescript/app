define(['require', 'underscore','marionette', 'App', 'logger','modalhelper' ,'./ScriptRunnerView'],
    function (require, _,Marionette, App, Logger,ModalHelper,ScriptRunnerView)
    {
        "use strict"
        function ScriptRunnerModal(options)
        {
            this.options = options || {};
        }

        _.extend(ScriptRunnerModal.prototype, {
            show: function ()
            {
                var self = this;

                App.execute(['modules:installed'], function (result)
                {
                    var view = new ScriptRunnerView({ summary: self.options.data, modules: result[0] });
                    var modalHelper = new ModalHelper();
                    modalHelper.view({
                        view: view, width: 700, height: 700,
                        title: 'Script Runner',
                        onCreate: function (modal)
                        {
                            self.options.onCreate && self.options.onCreate(view);
                        },
                        buttons: [{ text: 'Close', isDefault: true }]
                    });
                })


            }
        });

        return ScriptRunnerModal;

    }
)
