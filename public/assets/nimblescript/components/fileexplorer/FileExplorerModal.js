define(['require', 'underscore', 'marionette', 'App', 'logger', 'modalhelper', './FileExplorerView'],
    function (require, _, Marionette, App, Logger, ModalHelper, FileExplorerView)
    {
        "use strict"
        function FileExplorerModal(options)
        {
            this.options = _.extend({}, { height: 485, width: 800, allowedItems: ['file', 'dir'], mode: 'openFile' }, options);
        }

        _.extend(FileExplorerModal.prototype, {
            show: function ()
            {
                var self = this;
                this.view = new FileExplorerView(this.options);
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
                                if (self.options.onOK)
                                {
                                    callback(false);
                                    self.doOK(selectedItems);
                                    return;
                                }
                            default:
                                callback(true);
                        }
                    },
                    onCreate: function ($m)
                    {
                        // TODO: Fix jquery.splitter and this hack
                        var height = self.options.mode == 'saveFile' ? self.options.height - 115 : self.options.height - 85;
                        self.view.init({ height: height, debug: true, resizeTo: self.modalHelper.activeModal.find('.modal-body') });
                        self.modalHelper.toggleButton(self.actionText, !_.isEmpty(self.getFilename()));
                    }
                });
                this.view.listenTo(this.view, 'list:selection', function (e)
                {
                    self.updateButtonState();
                });
                this.view.listenTo(this.view, 'list:dblclick', function (e)
                {
                    if (e[0].type == 'dir')
                        return;

                    return self.doOK(e);
                });
                this.view.listenTo(this.view, 'filename:changed', function ()
                {
                    self.updateButtonState();
                    
                })


            },
            doOK: function (selectedItems)
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
                        hideModal = self.options.onOK(selectedItems);
                    if (hideModal === true)
                        self.modalHelper.close();

                }
            },
            updateButtonState: function ()
            {
                var buttonEnabled = false;
                var currentSelection = this.view.getSelection();
                switch (this.options.mode)
                {
                    case 'openFile':
                        buttonEnabled = !_.isEmpty(currentSelection) && currentSelection[0].type == 'file';
                        break;
                    case 'openDir':
                        buttonEnabled = !_.isEmpty(currentSelection) && currentSelection[0].type == 'dir';
                        break;
                    case 'saveFile':
                        buttonEnabled = !_.isEmpty(this.getFilename());
                        break;

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

        return FileExplorerModal;

    }
)
