define(['require', 'underscore', 'backbone', 'App', 'logger', 'modalhelper', './RepositoryExplorerView'],
    function (require, _, Backbone, App, Logger, ModalHelper, RepositoryExplorerView)
    {
        "use strict"
        function RepositoryExplorerModal(options)
        {
            this.options = _.extend({}, { height: 485, width: 800 }, options);
        }

        _.extend(RepositoryExplorerModal.prototype, Backbone.Events,
            {
            show: function ()
            {
                var self = this;
                this.view = new RepositoryExplorerView(this.options);
                this.actionText = this.options.mode.indexOf('open') == 0 ? 'Open' : 'Save';
                this.modalHelper = new ModalHelper();
                this.modalHelper.view({
                    view: this.view, width: this.options.width, height: this.options.height,
                    title: this.options.title,
                    buttons: [{
                        text: self.actionText,
                        isDefault: true
                    },
                        {
                            text: 'Cancel'
                        }
                    ],
                    onButton: function (text,callback)
                    {
                        switch (text)
                        {
                            case self.actionText:
                                var selectedItems = self.view.getSelection();
                                self.options.onOK && self.doOK(selectedItems, callback);
                                break;
                            default:
                                self.options.onCancel && self.options.onCancel();
                                callback(true);
                        }
                    },
                    onCreate: function ($m)
                    {
                        // TODO: Fix jquery.splitter and this hack
                        var height = self.options.mode == 'save' ? self.options.height - 115 : self.options.height - 85;
                        self.view.init({ height: height, debug: true, resizeTo: self.modalHelper.activeModal.find('.modal-body') });
                        self.modalHelper.toggleButton(self.actionText, !_.isEmpty(self.getFilename()));
                    }
                });
                this.listenTo(this.modalHelper, 'all', function (eventType)
                {
                    switch (eventType)
                    {
                        case 'closed':
                            self.trigger('closed');
                    }
                });
                this.listenTo(this.view, 'list:selection', function (e)
                {
                    self.updateButtonState();
                });
                this.listenTo(this.view, 'list:dblclick', function (e)
                {
                    if (e[0].type == 'dir')
                        return;

                    self.doOK(e);
                });
                this.listenTo(this.view, 'itemname:changed', function ()
                {
                    self.updateButtonState();
                })
                this.listenTo(this.view, 'directory:changed', function (dir)
                {
                    self.updateButtonState();
                })


            },
            doOK: function(selectedItems,callback)
            {
                console.log(selectedItems);
                var self = this;
                if (this.options.overwritePrompt && _.isEmpty(selectedItems) && this.view.isExistingFilename(this.getFilename()))
                {
                    new ModalHelper().confirm({
                        title: 'Confirm...', text: 'Do you wish to overwrite the existing file?',
                        onButton: function (text)
                        {
                            if (text == 'Yes')
                                doIt();
                            return true;
                        }
                    });
                }
                else
                    doIt();

                function doIt()
                {
                    var hideModal = true;
                    if (self.options.onOK)
                        hideModal = self.options.onOK(selectedItems,callback);
                    if (hideModal === true)
                        self.modalHelper.close();

                }

            },
            updateButtonState: function()
            {
                var buttonEnabled = false;
                var currentSelection = this.view.getSelection();
                var currentFolder = this.view.getDirectory();
                if (currentFolder != 'System')
                {
                    switch (this.options.mode)
                    {
                        case 'open':
                            buttonEnabled = !_.isEmpty(currentSelection) && currentSelection[0].type == 'file';
                            break;
                        case 'save':
                            buttonEnabled = !_.isEmpty(this.getFilename());
                            break;

                    }
                }

                this.modalHelper.toggleButton(this.actionText, buttonEnabled);
            },
            getFilename: function()
            {
                return this.view.getFilename();
            },
            getDirectory: function()
            {
                return this.view.getDirectory();
            },
            isAllowedItem: function (item)
            {
                return item && (item.type in this.options.allowedItems);
            }

        });

        return RepositoryExplorerModal;

    }
)
