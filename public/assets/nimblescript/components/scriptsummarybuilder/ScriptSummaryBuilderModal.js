define(['require', 'underscore','marionette', 'App', 'logger','modalhelper' ,'./ScriptSummaryBuilderView'],
    function (require, _,Marionette, App, Logger,ModalHelper,ScriptSummaryBuilderView)
    {
        "use strict"
        function ScriptSummaryBuilderModal(options)
        {
            this.options = options || {};
        }

        _.extend(ScriptSummaryBuilderModal.prototype, {
            show: function ()
            {
                var self = this;

                App.execute(['modules:installed'], function (result)
                {
                    var view = new ScriptSummaryBuilderView({ summary: self.options.data, modules: result[0] });
                    var modalHelper = new ModalHelper();
                    modalHelper.view({
                        view: view, width: 700, height: 500,
                        title: 'Summary Builder',
                        onCreate: function (modal)
                        {
                            self.options.onCreate && self.options.onCreate(view);
                        },
                        buttons: [{ text: 'Cancel' }, { text: 'Replace' }, { text: 'Append' }],
                        onButton: function (text)
                        {
                            if (!_.contains(['Cancel','X'], text) && self.options.onOK)
                                self.options.onOK(text == 'Replace', view.summary, view.summaryText);
                            else if (_.contains(['Cancel','X'],text) && self.options.onCancel)
                                self.options.onCancel();

                        }
                    });
                })


            }
        });

        return ScriptSummaryBuilderModal;

    }
)
