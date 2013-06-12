define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./templatebrowser.html', 'css!./templatebrowser',
    'text!./templatesummary.html', '../tree/TreeView', '../simplelist/SimpleListView'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, html, css, htmlTemplateSummary, TreeView,SimpleListView)
    {
        "use strict"

        return Marionette.Layout.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.Layout.prototype.constructor.apply(this, arguments);
                },
                regions: {
                    summaryContainer: 'div.summary',
                    sectionsContainer: 'div.sections',
                    templatesContainer: 'div.templates'
                },
                events: {
                },
                initialize: function(options)
                {
                    this._super(options);
                    this._templateManager = App.request('templates:getmanager');
                    this._sections = { general: { title: 'General' } };
                },
                template: Swig.compile(html),
                tagName: 'div',
                className: 'template-browser',
                onRender: function ()
                {
                    this.initSectionsTree();
                    this.populateTemplatesList();
                    this.initSummaryView();
                    this.initTemplatesList();
                },
                onDomRefresh: function ()
                {
                },
                onClose: function ()
                {
                },
                // Custom 
                initTemplatesList: function()
                {
                    var self = this;
                    this.templatesList = new SimpleListView({
                        onSelected: function (el, model)
                        {
                            var template = model.get('template');
                            self.updateSummary(template);
                            self.trigger('template:changed', template);
                        }
                    });
                    this.templatesContainer.show(this.templatesList);
                    this.listenTo(this.templatesList, 'all', this._onTemplatesListEVent)
                },
                initSectionsTree: function ()
                {
                    this.sectionsTree = new TreeView();
                    this.sectionsContainer.show(this.sectionsTree);
                    this.listenTo(this.sectionsTree, 'all', this._onSectionsTreeEVent);
                    
                },
                _onSectionsTreeEVent: function(eVentName)
                {
                    switch (eVentName)
                    {
                        case 'node:activate':
                            var node = arguments[2];
                            this.showSectionTemplates(node.data.key);
                            break;
                    }
                },
                _onTemplatesListEVent: function(eVentName)
                {
                    switch (eVentName)
                    {
                        case 'dblclick':
                            var el = arguments[1];
                            var itemview = $(el).data('itemview');
                            this.trigger('template:dblclick', itemview.model.get('template'));
                            break;
                    }
                },
                showSectionTemplates: function(sectionPath)
                {
                    var sectionNode = this.sectionsTree.getNodeByKey(sectionPath);
                    if (sectionNode)
                    {
                        var templates = sectionNode.data.templates;
                        var collection = this.templatesList.collection;
                        var models = _.map(templates, function (template)
                        {
                            return { text: template.filename, template: template };

                        });
                        collection.set(models);
                        if (collection.length)
                            this.templatesList.selectItem(0);
                        else
                        {
                            this.trigger('template:changed', null);
                            this.updateSummary();
                        }

                    }
                },
                initSummaryView: function ()
                {
                    this._summaryView = new (Marionette.ItemView.extend({
                        template: Swig.compile(htmlTemplateSummary),
                        className: 'template-summary',
                        modelEvents: {
                            "change": "render"
                        }
                    }))({ model: new Backbone.Model() });
                    this.summaryContainer.show(this._summaryView);
                },
                populateTemplatesList: function ()
                {
                    this.sectionsTree.getRoot().removeChildren();
                    var self = this;
                    this.temp
                    _.each(this._templateManager.getTemplates(), function(template)
                    {
                        var sectionNode = self.getSection(template.section || 'General');
                        var title = template.title || template.filename;
                        sectionNode.data.templates.push(template);
                    })
                },
                getSection: function(sectionPath)
                {
                    if (_.isEmpty(sectionPath) )
                        return;

                    var sectionNode = this.sectionsTree.getNodeByKey(sectionPath);
                    if (sectionNode)
                        return sectionNode;

                    var parts = sectionPath.split('/');
                    var progressivePaths = parts.slice(0, 1);
                    _.each(parts.slice(1), function (v, i)
                    {
                        progressivePaths.push(_.last(progressivePaths) + '/' + v);
                    });
                    progressivePaths.reverse();
                    var sectionNode;
                    for (var i = 0; i < progressivePaths.length; i++)
                    {
                        sectionNode = this.sectionsTree.getNodeByKey(progressivePaths[i]);

                        var parentNode;
                        if (!sectionNode && (i + 1) == progressivePaths.length)
                            parentNode = this.sectionsTree.getRoot();
                        else if (!sectionNode)
                            parentNode = this.sectionsTree.getNodeByKey(progressivePaths[i + 1]);
                        if (parentNode && !sectionNode)
                        {
                            var currentTitle = progressivePaths[i].split('/').pop();
                            sectionNode = parentNode.addChild({
                                title: currentTitle, key: progressivePaths[i], icon: false, isFolder: true,
                                templates: []
                            });
                            if (i == 0)
                                break;
                            else
                                i = i - 2;
                        }
                    }
                    
                    return sectionNode;
                    
                },
                updateSummary: function (template)
                {
                    var model = this._summaryView.model;
                    var type, description, image;
                    if (template)
                    {
                        var templateType = _.result(template, 'type') || 'text';

                        switch (templateType)
                        {
                            case 'text':
                                type = 'File content'
                                description = template.path;
                                break;
                            case 'custom':
                                type = template.displayType;
                                break;
                        }
                    }
                    model.set({ type: type, description: description })
                }
            });

            
    }
)
