define(['marionette', 'backbone', 'underscore', 'swig', 'jquery', 'jquery.ui', 'jquery.splitter', 'cookie', 'App', 'text!./main.html',
    'css!./mainview.css', 'translate'],
    function (Marionette, Backbone, _, Swig, $, $JQueryUI, $JQuerySplitter, Cookie, App, mainHtml,T)
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
            template: Swig.compile(mainHtml),
            className: 'splitter-view',
            onDomRefresh: function ()
            {
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

            // Very crude panel showing on widget additions
            var widgetManager = App.request('widgets:getmanager');
            widgetManager.on('shown', function (widgetContainer)
            {
                if ($el.find('.splitter-bar').is('.splitter-bar-vertical-docked'))
                    $el.trigger('undock');
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
                documentManager.showDocument(existingStartPageDoc[0]);
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