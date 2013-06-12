define(['marionette', 'backbone', 'underscore', 'swig', 'jquery', 'jquery.ui', 'jquery.layout', 'App', 'text!./main.html', 'css!./mainview.css', 'translate'],
    function (Marionette, Backbone, _, Swig, $, $JQueryUI, $JQuerySplitter, App, html,css,T)
    {
        "use strict";

        App.commands.setHandler('view:startpage', function ()
        {
            showStartPage('startPage');
        });

        App.commands.setHandler('help:about', function ()
        {
            require(['bootstrap-modal', 'text!content/about.html'], function (modal, AboutText)
            {
                var modal = $(AboutText).modal({ height: '400px' });
            });
        });

        return Marionette.Layout.extend({
            template: Swig.compile(html),
            className: 'main-container',
            onDomRefresh: function ()
            {
                var innerLayoutOptions = {
                    center__paneSelector: ".ui-layout-center"
                    , west__paneSelector: ".ui-layout-west"
                    , east__paneSelector: ".ui-layout-east"
                    , west__size: .33
                    , east__size: .33
                    , spacing_open: 8  // ALL panes 
                    , spacing_closed: 12  // ALL panes 
                    , west__spacing_closed: 12
                    , east__spacing_closed: 12
                    , resizeWhileDragging: true
                };

                this.$el.layout(innerLayoutOptions);
                App.request('documents:getmanager').setContainer(this.$el.find('.documents'));
                // atStartup();
                return;
                createSplitter(this.$el);
                setupWidgetPanels(this.$el);

                this.$el.find('.document-tabs').sortable({ containment: 'parent' });
                App.request('widgets:getmanager').setContainers(this.$el.find('.widgets'));
                App.request('documents:getmanager').setContainer(this.$el.find('.documents'));

                atStartup();
                window.onbeforeunload = shutdown;

            }
        })


        function createSplitter($el)
        {
            $el.splitter({
                type: "v",
                outline: false,
                sizeLeft: 200,
                minLeft: 200,
                resizeToWidth: true,
                dock: "left",
                dockSpeed: 200,
                cookie: "ns-main-splitter",
                anchorToWindow: true
            });

        }

        function setupWidgetPanels($el)
        {
            $el.find('.widgets').sortable(
                {

                    // placeholder: 'widget-placeholder',
                    containment: '.widget-panel',
                    handle: '.widget-title',
                    update: function (e)
                    {
                        $(this).trigger('layout-change');
                    }
                    // connectWith: '.widgets', 
                    // appendTo: 'body'*/, 
                    // helper: 'clone',
                });

        }
        function atStartup()
        {
            var settingsManager = App.request('settings:getmanager');
            if (settingsManager.lastUserSettings.startup.atStartup.indexOf('startPage') == 0)
                showStartPage(settingsManager.lastUserSettings.startup.atStartup);
        }

        function showStartPage(mode)
        {
            var documentManager = App.request('documents:getmanager');
            var existingStartPageDoc = documentManager.getDocuments('startPage');
            if (existingStartPageDoc.length)
                documentManager.showDocument(existingStartPageDoc[0].container.documentId);
            else
            {
                App.execute('components:get', ['xemware.nimblescript.component.startpage'], function (err, Components)
                {
                    switch (mode)
                    {
                        case 'startPage':
                            documentManager.addDocument(Components[0].createDocument());
                            break;
                        case 'startPageModal':
                            Components[0].showModal();
                            break;
                    }

                })
            }
        }

        function shutdown()
        {
            var documentManager = App.request('documents:getmanager');
            if (documentManager)
            {
                if (documentManager.getDirtyDocuments().length)
                    return T.t('misc.exit_dirty_documents');

                documentManager.closeAll();
            }

            var widgetManager = App.request('widgets:getmanager');
            if (widgetManager)
            {
                widgetManager.saveLayout();
            }
        };


    }
)