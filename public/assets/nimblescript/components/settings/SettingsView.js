define(['require', 'jquery', 'underscore', 'marionette', 'App', 'backbone', 'swig', 
    'text!./sections/settings.html', 'modalhelper', 'async', 'dynatree', 'translate','cookie'],
    function (require, $, _, Marionette, App, Backbone, Swig, settingsHtml, ModalHelper, Async, $dynatree, T, Cookie)
    {
        // Register standard sections
        var settingsManager = App.request('settings:getmanager');
        settingsManager.registerSection(
            { id: 'environment', title: 'Environment' });
        settingsManager.registerSection(
            { id: 'general', title: 'General', parent: 'environment', Constructor: _.bind(createSectionInstance, { path: './sections/General' }) });
        settingsManager.registerSection(
            { id: 'startup', title: 'Startup', parent: 'environment', Constructor: _.bind(createSectionInstance, { path: './sections/Startup' }) });
        settingsManager.registerSection(
            { id: 'resources', title: 'Resources', Constructor: _.bind(createSectionInstance, { path: './sections/Resources' }) });
        settingsManager.registerSection(
            { id: 'scriptexecution', title: 'Script Execution', Constructor: _.bind(createSectionInstance, { path: './sections/ScriptExecution' }) });
        settingsManager.registerSection(
            { id: 'repositories', title: 'Repositories', Constructor: _.bind(createSectionInstance, { path: './sections/Repositories' }) });

        function createSectionInstance(callback)
        {
            require([this.path], function(Section)
            {
                callback(new Section());
            })
        }

        return SettingsView = Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(settingsHtml),
                tagName: 'div',
                className: 'settings',
                initialize: function ()
                {
                    this._super();
                    this.loadedSections = {};
                },
                onRender: function ()
                {
                    this.initSectionTree();
                    this.initSections();

                    var initialSection = this.options.initialSection;
                    if (!initialSection)
                        initialSection = Cookie.get('ns-last-settings-section');
                    if (!initialSection)
                        initialSection = 'general';

                    this.showSection(initialSection);
                },
                initSectionTree: function ()
                {
                    var opts = this.options;
                    var viewSelf = self = this;
                    this.$el.find('.section-tree').dynatree({
                        // autoFocus: true,
                        selectMode: 1,
                        clickFolderMode: 1,
                        debugLevel: 0,
                        autoFocus: false,
                        onClick: this.treeOnClick,
                        onDblClick: this.treeOnDblClick
                    });

                    this.sectionTree = this.$el.find('.section-tree').dynatree('getTree');

                },
                treeOnDblClick: function ($node, e)
                {
                    $node.toggleExpand();
                    this.treeOnClick($node,e)
                },
                treeOnClick: function ($node, e)
                {
                    return this.showSection($node.data.key, e);
                },
                initSections: function ()
                {
                    var self = this;
                    
                    this.sections = {};
                    // Add section content
                    _.each(this.model.get('sections'), function (Section)
                    {
                        var parentNode = self.sectionTree.getNodeByKey(Section.parent) || self.sectionTree.getRoot();
                        var sectionNode = parentNode.addChild({
                            title: Section.title,
                            key: Section.id,
                            icon: false
                        });
                    });

                },
                createSectionPath: function(path)
                {
                    var parentPath, parentNode = this.sectionTree.getRoot();
                    _.each(path, function(sectionTitle)
                    {

                    })
                },
                showSection: function (id, e)
                {
                    var self = this;
                    if (id)
                    {
                        var shouldCancel = _.any(this.askSections('beforeSectionChange', self.currentSectionId, id), { result: false });
                        if (!self.currentSectionId || !shouldCancel)
                        {
                            self.$el.find('.tab-pane').removeClass('active');
                            settingsManager.getSectionInstance(id, function (sectionInstance)
                            {
                                if (!sectionInstance)
                                {
                                    // Select first child
                                    var node = self.sectionTree.getNodeByKey(id);
                                    if (node.hasChildren())
                                    {
                                        node = node.getChildren()[0];
                                        return self.showSection(node.data.key, e);
                                    }
                                    self.selectionTree.activateKey(id);
                                    return false;
                                }
                                self.loadedSections[id] = sectionInstance;

                                if (!self.$el.find('div.tab-pane[section-id=' + id + ']').length)
                                {
                                    var $tabContent = $('<div class="tab-pane" section-id="' + id + '">');
                                    $tabContent.append(sectionInstance.renderContent({ model: self.model }));
                                    self.$el.find('div.tab-content').append($tabContent);
                                }
                                self.$el.find('.tab-pane[section-id=' + id + ']').addClass('active');
                                self.currentSectionId = id;
                                if (!e)
                                    self.sectionTree.activateKey(id);
                            })

                        }
                        else
                        {
                            if (self.currentSectionId && !e)
                            {
                                self.sectionTree.activateKey(self.currentSectionId);
                            }
                        }
                        return !shouldCancel;
                    }
                },
                saveSettings: function (callback)
                {
                    var sectionBeforeSave = this.askSections('beforeSave');
                    var cantSaveSections = _.where(sectionBeforeSave, 'result');
                    if (cantSaveSections.length)
                    {
                        var messages = _.map(cantSaveSections, function (s)
                        {
                            return s.result.toString();
                        })
                        callback(messages.join(';'));
                        return;
                    }

                    this.askSections('save');
                    App.execute('settings:save', this.model.get('settings'), function (error)
                    {
                        callback();
                    });
                },
                isDirty: function ()
                {
                    return _.any(this.askSections('isDirty'), { result: true });
                },
                askSections: function (command)
                {
                    var a = _.map(this.loadedSections, function (s)
                    {
                        var result;
                        if (_.isFunction(s[command]))
                            result = s[command].apply(s, Array.prototype.slice.call(arguments, 1));

                        return { sectionInstance: s, result: result }
                    })
                    return a;
                },
                onClose: function ()
                {
                    this.askSections('close');
                    Cookie.set('ns-last-settings-section', this.currentSectionId, { expires: 365 });

                }
            }
            )


    }
)