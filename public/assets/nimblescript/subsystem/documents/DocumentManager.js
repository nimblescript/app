define(['require', 'jquery', 'backbone', 'underscore', 'Vent', 'swig','App', 'logger', './DocumentContainer', 'keyboardshortcuts', 'text!./documenttab.html'],
    function (require, $, Backbone, _, Vent, Swig, App, Logger, DocumentContainer, KeyboardShortcuts, documentTabHtml)
    {
        "use strict"


        function DocumentManager()
        {
        }

        _.extend(DocumentManager.prototype, Backbone.Events, {
            init: function (options)
            {
                this.documentContainers = {};
                this.menuManager = App.request('menu:getmanager');
                this.documentsMenu = this.menuManager.findMenu('view.documents');
                this.hookMenus();
                this.updateMenu();
                this.setActiveContainer(null);
                this.trigger('ready');
                this._documentTabCompiled = Swig.compile(documentTabHtml);
            },
            _trigger: function (eVentName, container, exData)
            {
                var eVentData = _.extend({}, {
                    container: container,
                    document: container.document
                }, exData);
                this.trigger(eVentName,eVentData);
                return eVentData;
            },
            addDocument: function (document, options)
            {
                options = options || {};

                var container = new DocumentContainer({ document: document, documentManager: this });
                var documentId = _.result(container, 'documentId');
                this.documentContainers[documentId] = container;

                this.addToMenu(container);

                // TODO: Should really ask container to add the document, hard coded tab-pane for now.

                // Add tab
                var $tabHeader = $(this._documentTabCompiled({ id: documentId, title: _.result(document, 'title'), iconclass: _.result(document,'iconClass') }));
                this.$container.find('.nav-tabs').append($tabHeader);
                if (!this.documentContainers.length)
                    $tabHeader.addClass('first');

                this.updateDocumentTitle(container);

                // Add tab pane
                this._trigger('adding', container);
                this.$container.find('.tab-content').append(container.render().$el);
                this._trigger('added', container);
                // Show document
                $tabHeader.find('a').tab('show');

                this.updateMenu();
                this.listenTo(container, 'changed', this.documentChanged);
                this.listenTo(container, 'saved', this.documentChanged);

            },
            updateDocumentTitle: function (documentContainer)
            {
                // Update title
                var isDirty = _.result(documentContainer.document, 'isDirty');
                var title = _.result(documentContainer.document, 'title');
                if (isDirty)
                    title += '*';

                var tooltip = _.result(documentContainer.document, 'tooltip');
                if (!tooltip)
                    tooltip = title;

                this.$container.find('.nav-tabs li > a[document-id=' + documentContainer.documentId + '] span').text(title);
                this.$container.find('.nav-tabs li > a[document-id=' + documentContainer.documentId + ']').parent().attr('title', tooltip);

                var menu = this.menuManager.findMenu('document.' + documentContainer.documentId);
                menu.set('label', title);
            },
            documentChanged: function (documentContainer)
            {
                this.updateDocumentTitle(documentContainer);
                this._trigger('changed', documentContainer);
            },
            getContainer: function (documentRef)
            {
                return _.isObject(documentRef) ? this.documentContainers[_.result(documentRef, 'id')] : this.documentContainers[documentRef];
            },
            setActiveContainer: function (container)
            {
                this._activeContainer = container;
            },
            getActiveContainer: function ()
            {
                return this._activeContainer;
            },
            getActiveDocument: function ()
            {
                return this.getActiveContainer() && this.getActiveContainer().document;
            },
            getDirtyDocuments: function ()
            {
                return _.filter(this.getDocuments(), function (doc)
                {
                    return _.result(doc, 'isDirty');
                })
            },
            getDocuments: function (filter, active)
            {
                var documents = [];
                if (active)
                {
                    var activeDoc = this.getActiveDocument();
                    if (activeDoc) documents.push(activeDoc);
                }
                else // all
                {
                    var d = _.map(this.documentContainers, function (container)
                    {
                        return container.document;
                    })

                    documents = filter ? _.filter(d, filter) : d;
                }
                return documents;
            },
            actionDocuments: function (action, filter, active)
            {
                var documents = this.getDocuments(filter, active);
                var results = _.map(documents, function (document)
                {
                    return document.doAction(action);
                });

            },
            showDocument: function (documentRef, options)
            {
                options = options || {};

                var documentContainer = documentRef instanceof DocumentContainer ? documentRef : this.getContainer(documentRef);
                if (!documentContainer)
                    return;

                this.$container.find('.nav-tabs a.title[href=#document-' + documentContainer.documentId + ']').tab('show');


            },
            showNextDocument: function ()
            {
                var activeContainer = this.getActiveContainer();
                var nextContainer;
                if (activeContainer)
                {
                    var keys = _.keys(this.documentContainers);
                    var index = keys.indexOf(activeContainer.documentId.toString());
                    var nextIndex = index - 1;
                    if (nextIndex == -1)
                        nextIndex = keys.length - 1;

                    if (nextIndex != index)
                        nextContainer = this.documentContainers[keys[nextIndex]];
                }
                if (nextContainer)
                    this.showDocument(nextContainer)
                else
                    this.setActiveContainer(null);

            },
            closeAll: function (force)
            {
                var self = this;
                _.each(_.keys(this.documentContainers), function (i)
                {
                    self.closeDocument(i, { force: true })
                })
            },
            closeActive: function ()
            {
                this.closeDocument(this.getActiveContainer());
            },
            closeDocument: function (documentRef, options)
            {
                options = options || {};
                var documentContainer = _.isObject(documentRef) ? documentRef : this.getContainer(documentRef);
                if (!documentContainer)
                    return;

                if (!options.force && _.result(documentContainer.document, 'beforeClose') === false)
                {
                    options.callback && options.callback(false);
                    return false;
                }

                var eVentData = this._trigger('closing', documentContainer, { cancel: false });
                if (!options.force && eVentData.cancel)
                {
                    options.callback && options.callback(false);
                    return false;
                }

                if (_.result(documentContainer.document, 'close') === false && !options.force)
                {
                    options.callback && options.callback(false);
                    return false;
                }

                this._trigger('closed', documentContainer);
                if (documentContainer == this.getActiveContainer())
                    this.showNextDocument();

                documentContainer.close();
                this.$container.find('.nav-tabs a.title[href=#document-' + documentContainer.documentId + ']').parent().remove();
                // this.$container.find('.nav-tabs a.title').first().tab('show');
                var menu = this.menuManager.findMenu('document.' + documentContainer.documentId);
                menu.collection.remove(menu);
                delete this.documentContainers[documentContainer.documentId];
                this.updateMenu();

            },
            addToMenu: function (container)
            {
                this.documentsMenu.get('subitems').add(
                    {
                        id: 'document.' + container.documentId,
                        document_id: container.documentId,
                        label: _.result(container.document, 'title'),
                        href: '#',
                        command: 'documents:show'
                    })

            },
            /*
                Dynamically update Edit menu actions based on state of active document
            */
            hookMenus: function ()
            {
                var self = this;
                var editActionMap = {
                    'copy': 'edit.copy',
                    'cut': 'edit.cut',
                    'paste': 'edit.paste',
                    'redo': 'edit.redo',
                    'undo': 'edit.undo',
                }
                var fileActionMap = {
                    'save': 'document.save',
                    'saveas': 'document.saveas'
                }

                Vent.on('menu:opened:edit', function (model)
                {
                    checkSupportedActions(editActionMap);
                });
                Vent.on('menu:opened:file', function (model)
                {
                    var activeContainer = self.getActiveContainer();
                    var closeMenuItem = self.menuManager.findMenu('document.close');
                    closeMenuItem.set('disabled', !activeContainer);
                    checkSupportedActions(fileActionMap);
                });

                function checkSupportedActions(actionMap)
                {
                    var activeDocument = self.getActiveDocument();
                    var availableActions = _.result(activeDocument, 'supportedActions') || [];
                    _.each(_.keys(actionMap), function (a)
                    {
                        var menu = self.menuManager.findMenu(actionMap[a]);
                        if (menu)
                            menu.set('disabled', availableActions.indexOf(a) < 0);
                    })

                }
            },
            updateMenu: function (document)
            {
                if (_.keys(this.documentContainers).length)
                {
                    var noDocumentsMenuItem = this.menuManager.findMenu('view.documents.none');
                    if (noDocumentsMenuItem)
                        this.documentsMenu.get('subitems').remove(noDocumentsMenuItem);
                }
                else
                {
                    this.documentsMenu.get('subitems').add(
							{
							    "id": "view.documents.none",
							    "label": "No Documents",
							    "href": "#",
							    "i18n": "view.documents.none",
							    "disabled": true
							});
                }
            },
            // Called by MainView to specify containers for documents
            // TODO: Review container management
            setContainer: function ($selector)
            {
                var self = this;
                if (this.$container)
                    throw new Error('Document container already set');

                this.$container = $($selector);

                // Bootstrap Tab events
                // About to show tab - return false to cancel
                this.$container.on('show.documentmanager', 'a[data-toggle=tab]', function (e)
                {
                    var documentId = $(e.currentTarget).attr('document-id');
                    var container = self.getContainer(documentId);
                    var ret = container.document.beforeShow();
                    if (ret === false)
                        return false;
                    self._trigger('showing', container, {
                        cancel: false});
                });

                // Document tab shown/active
                this.$container.on('shown.documentmanager', 'a[data-toggle=tab]', function (e)
                {
                    var documentId = $(e.currentTarget).attr('document-id');
                    var container = self.getContainer(documentId);
                    self.setActiveContainer(container);
                    container.document.afterShow();
                    self._trigger('shown', container);
                });
                // Close X icon on tab header
                this.$container.on('click.documentmanager', 'i.closedoc', function (e)
                {
                    var documentId = $(e.currentTarget).parent().attr('document-id');
                    documentManager.closeDocument(documentId);
                });
            },
            notifyExternalDocumentAction: function (document, action)
            {
                var container = this.getContainer(document);
                if (container)
                {
                    this._trigger(action, container);
                }
            }
        })

        var documentManager = new DocumentManager();

        App.reqres.setHandler('documents:getmanager', function ()
        {
            return documentManager;
        })

        // TODO: Update menu eVent naming to make clear
        App.commands.setHandler('documents:show', function (menuItem)
        {
            documentManager.showDocument(menuItem.get('document_id'));
        })

        App.commands.setHandler('edit:command', function (menuItem)
        {
            documentManager.actionDocuments(menuItem.get('action'), null, menuItem.get('document-target') == 'active');
        })

        App.commands.setHandler('document:command', function (menuItem)
        {
            if (menuItem.get('action') == 'close')
                documentManager.closeActive();
            else
                documentManager.actionDocuments(menuItem.get('action'), null, menuItem.get('document-target') == 'active');
        })


        // Keyboard handlers
        // Documents
        // Save active
        KeyboardShortcuts.bind('ctrl+s', function (e)
        {
            KeyboardShortcuts.preventDefault(e);
            documentManager.actionDocuments('save', null, true);
            return false;
        });


        // Save all
        KeyboardShortcuts.bind('ctrl+shift+s', function (e)
        {
            KeyboardShortcuts.preventDefault(e);
            documentManager.actionDocuments('save', null, false);
            return false;
        });
        // Close active
        KeyboardShortcuts.bind('alt+w', function (e)
        {
            KeyboardShortcuts.preventDefault(e);
            documentManager.closeActive();
            return false;
        });

        return documentManager;
    }
);