define(['require', 'underscore', 'backbone', 'marionette', 'App', 'logger', 'modalhelper', './TemplateBrowserView'],
    function (require, _, Backbone, Marionette, App, Logger, ModalHelper, TemplateBrowserView)
    {
        "use strict"
        function TemplateBrowserModal(options)
        {
            this.options = _.extend({}, options);
        }

        _.extend(TemplateBrowserModal.prototype, Backbone.Events, {
            show: function ()
            {
                var modalHelper = new ModalHelper();
                var self = this;
                var view = new TemplateBrowserView(this.options);
                modalHelper.view({
                    view: view, width: 800, height: 500,
                    buttons: [
                        {
                            text: 'Open', isDefault: true
                        },
                        {
                            text: 'Cancel'
                        }
                    ],
                    title: this.options.title,
                    onButton: function (text)
                    {
                        self._lastButtonClicked = text;
                        switch (text)
                        {
                            case "Open":
                                return self.doOpen(self._selectedTemplate);
                                break;
                        }
                    },
                    onClose: function ()
                    {
                        self.options.onClose && self.options.onClose(self._lastButtonClicked, self._selectedTemplate);
                    },
                    onCreate: function ($m)
                    {
                        modalHelper.toggleButton('Open', false);
                    }
                });
                view.listenTo(view, 'template:changed', function (template)
                {
                    self._selectedTemplate = template;
                    modalHelper.toggleButton('Open', template);
                    self.trigger('template:changed', template);
                });

                view.listenTo(view, 'template:dblclick', function (template)
                {
                    var retValue = self.doOpen(template);
                    if (retValue !== false)
                        modalHelper.close();
                });


            },
            selectedTemplate: function ()
            {
                return this._selectedTemplate;
            },
            doOpen: function (template)
            {
                if (this.options.onOpen)
                    return this.options.onOpen(template);

            }

        });

        return TemplateBrowserModal;

    }
)
