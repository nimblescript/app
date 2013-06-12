define(['require', 'underscore','marionette', 'App', 'logger','modalhelper' ,'./ScriptParametersBuilderView'],
    function (require, _,Marionette, App, Logger,ModalHelper,ScriptParametersBuilderView)
    {
        "use strict"
        function ScriptParametersBuilderModal(options)
        {
            this.options = options || {};
        }

        _.extend(ScriptParametersBuilderModal.prototype, {
            show: function ()
            {
                var self = this;
                var view = new ScriptParametersBuilderView({ collection: this.options.params});
                var modalHelper = new ModalHelper();
                modalHelper.view({
                    view: view, width: 700, height: 500,
                    title: 'Parameters Builder', 
                    onCreate: function (modal)
                    {
                        self.options.onCreate && self.options.onCreate(view);
                    },
                    buttons: [{ text: 'Cancel' }, { text: 'Replace' }, { text: 'Append' }],
                    onButton: function(text)
                    {
                        if (!_.contains(['Cancel','X'],text) && self.options.onOK)
                            self.options.onOK(text == 'Replace', view.parameters, view.parametersText)
                        else if (_.contains(['Cancel','X'],text) && self.options.onCancel)
                            self.options.onCancel();
    
                    }
                });


            }
        });

        return ScriptParametersBuilderModal;

    }
)
