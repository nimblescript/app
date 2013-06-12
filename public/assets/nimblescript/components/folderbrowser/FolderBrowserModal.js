define(['require', 'underscore','backbone', 'marionette', 'App', 'logger', 'modalhelper', './FolderBrowserView'],
    function (require, _, Backbone, Marionette, App, Logger, ModalHelper, FolderBrowserView)
    {
        "use strict"
        function FolderBrowserModal(options)
        {
            this.options = _.extend({}, { selectionMode: 'single',allowedItems: ['file', 'dir'] }, options);
        }

        _.extend(FolderBrowserModal.prototype, 
        {
            show: function ()
            {
                var self = this;
                var view = this.view = new FolderBrowserView(this.options)
                view.listenTo(view, 'node:dblclick', function (tree, node)
                {
                    if (!node.data.isFolder && _.contains(self.options.allowedItems, 'file') ) // Don't return dir on dblclick
                    {
                        var hideModal = true;
                        if (self.options.onOK)
                            hideModal = self.options.onOK([{ path: node.data.key, type: 'file' }]); // Pass single item array of double clicked item
                        if (hideModal === true)
                            modalHelper.close();
                    }
                });
                var modalHelper = new ModalHelper();
                modalHelper.view({
                    view: view, width: 800, height: 400,
                    title: this.options.title,
                    onButton: function (text)
                    {
                        switch (text)
                        {
                            case "OK":
                                if (self.options.onOK)
                                {
                                    var items = [];
                                    if (self.options.selectionMode == 'single')
                                    {
                                        var node = view.activeNode();
                                        if (node)
                                            items.push({ path: node.data.key, type: node.data.isFolder ? 'dir' : 'file' });
                                    }
                                    else
                                    {
                                        var selectedItems = view.getSelection();
                                        var items = _.map(selectedItems, function (item)
                                        {
                                            return { path: item.data.key, type: item.data.isFolder ? 'dir' : 'file' };
                                        });
                                    }
                                    return self.options.onOK(items);
                                }
                        }
                    }
                });
                return modalHelper;
            },
            isAllowedItem: function (item)
            {
                return item && this.options.allowedItems.indexOf(item.type) >= 0;
            },
            getDirectory: function ()
            {
                return this.view.getDirectory();
            }

        });

        return FolderBrowserModal;

    }
)
