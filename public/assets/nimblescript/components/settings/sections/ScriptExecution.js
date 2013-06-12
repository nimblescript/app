define(['require', 'jquery', 'underscore', 'backbone', 'swig', 'marionette', 'App', 'logger', 'text!./scriptexecution.html', 'text!./moduleitem.html', './Section'],
    function (require, $, _, Backbone, Swig, Marionette, App, Logger, htmlTemplate, moduleItemHtml, Section)
    {
        "use strict"

        var ModuleItemView = Marionette.ItemView.extend({
            template: Swig.compile(moduleItemHtml),
            tagName: 'tr',
            onRender: function ()
            {
                this.$el.attr('data-module-id', this.model.id)
            }
        });

        var ModulesView = Marionette.CollectionView.extend({
            itemView: ModuleItemView,
            tagName: 'tbody',
            appendHtml: function (collectionView, itemView)
            {
                collectionView.$el.append(itemView.$el.children());
            }
        });


        var View = Marionette.Layout.extend({
            template: Swig.compile(htmlTemplate),
            regions:
                {
                    'modules': '.modules-list'
                },
            initialize: function ()
            {
                this._super();
                this._isDirty = false;
            },
            ui: {
                maxRunningTime: '[name="script-max-running-time"]',
                maxRecentItems: '[name="script-max-recent-items"]',
            },
            onRender: function ()
            {
                var settings = this.model.get('settings');
                this.ui.maxRunningTime.val(settings.scriptExecution.maxRunningTime);
                this.ui.maxRecentItems.val(settings.scriptExecution.maxRecentItems);
                
                this.modules.show(new ModulesView({ collection: this.createModuleCollection(this.model.get('modules')) }));

                // Populate users module settings
                for (var moduleId in settings.modules)
                {
                    var moduleSettings = settings.modules[moduleId].settings;
                    for (var settingId in moduleSettings)
                    {
                        var value = moduleSettings[settingId];
                        this.$el.find('.modules-list [data-module-id=' + moduleId + '][data-setting-id=' + settingId + ']').find('input').val(value);
                    }
                }

            },
            createModuleCollection: function (modules)
            {
                var coll = new Backbone.Collection(modules);
                var userModules = this.model.get('settings').modules;
                coll.each(function (module)
                {
                    module.set('enabled', !!_.result(userModules[module.id], 'enabled'));
                })
                return coll;
            },
            // Other
            validate: function (displayErrors)
            {
                var errors = [];
                return errors;
            },
            setDirty: function (dirty)
            {
                this._isDirty = dirty;
            },
            isDirty: function ()
            {
                return this._isDirty;
            },
            save: function ()
            {
                if (this.validate(false).length)
                    return false;

                var scriptExecutionSettings = this.model.get('settings').scriptExecution;
                scriptExecutionSettings.maxRunningTime = parseInt(this.ui.maxRunningTime.val());
                scriptExecutionSettings.maxRecentItems= parseInt(this.ui.maxRecentItems.val());

                var userModules = this.model.get('settings').modules;
                this.$el.find('.modules-list tbody tr').has('td.module-enabled input').each(function ()
                {
                    var moduleId = $(this).attr('data-module-id');
                    userModules[moduleId] = userModules[moduleId] || {};
                    userModules[moduleId].enabled = $(this).find('input').prop('checked');
                });
                
                
                this.$el.find('[data-module-id][data-setting-id]').each(function (k, el)
                {
                    var moduleId = $(el).attr('data-module-id');
                    var settingsId = $(el).attr('data-setting-id');
                    var value = $(el).find('input').val();
                    userModules[moduleId] = userModules[moduleId] || {};
                    userModules[moduleId].settings = userModules[moduleId].settings || {};
                    userModules[moduleId].settings[settingsId] = value;
                });
            }

        });
         
        var ScriptExecutionSection = Section.extend({
            // Public 'Section' interface
            init: function (options)
            {
                _.bindAll(this);
            },
            sectionId: function ()
            {
                return "scriptexecution";
            },
            title: function ()
            {
                return "Script Execution";
            },
            beforeSave: function ()
            {

            },
            save: function ()
            {
                return this.view.save();
            },
            isDirty: function ()
            {
                return false;
            },
            beforeSectionChange: function ()
            {
                return this.validate();
            },
            renderContent: function (options)
            {
                this.view = new View({ model: options.model });
                return this.view.render().$el;
            },
            close: function ()
            {
                this.view.close();
            }

        });

        return ScriptExecutionSection;
    }
)
