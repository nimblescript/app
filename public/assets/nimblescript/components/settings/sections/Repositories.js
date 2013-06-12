define(['require', 'jquery', 'underscore', 'Vent', 'swig', 'marionette', 'App', 'logger', 'text!./repositories.html', 'text!./repositorysummary.html',
    './Section', 'translate'],
    function (require, $, _, Vent, Swig, Marionette, App, Logger, repositoriesHtml, repositorySummaryHtml,Section,T)
    {
        "use strict"

        var RepositorySummaryItemView = Marionette.ItemView.extend({
            template: Swig.compile(repositorySummaryHtml),
            tagName: 'tr',
            onRender: function ()
            {
                
            }
        });

        var RepositorySummariesView = Marionette.CollectionView.extend({
            itemView: RepositorySummaryItemView,
            tagName: 'tbody',
            appendHtml: function (collectionView, itemView)
            {
                collectionView.$el.append(itemView.$el);
            }
        });


        var View = Marionette.Layout.extend({
            template: Swig.compile(repositoriesHtml),
            constructor: function()
            {
                _.bindAll(this);
                Marionette.Layout.prototype.constructor.apply(this, arguments);
            },
            initialize: function (options)
            {
                this._super();
                var customRepositories = _.result(this.model.get('settings').repositories, 'custom');
                this.collection = this.createRepositoryCollection(customRepositories || []);
                this._isDirty = false;
            },
            regions:
                {
                    repositories: 'table.repositories'
                },
            events: {
                'click a.add-dir': 'browseForDir',
                'click a.remove-dir': 'removeSelected',
                'click input.toggle-all': 'toggleSelection'
            },
            onRender: function()
            {
                this.repositories.ensureEl();
                this.repositories.$el.append(new RepositorySummariesView(
                    { collection: this.collection  }).render().$el);


            },
            createRepositoryCollection: function (repositories)
            {
                var coll = new Backbone.Collection(repositories);
                return coll;
            },
            browseForDir: function()
            {
                var self = this;
                App.execute('components:get', ['xemware.nimblescript.component.fileexplorer'], function (err, Components)
                {
                    Components[0].showModal({
                        allowedItems: ['dir'], title: 'Select a directory...',
                        onOK: function (selectedItems)
                        {
                            self.addDir(selectedItems[0].key, 'R')
                            return true;
                        }
                    });
                });

            },
            addDir: function(path, storeType)
            {
                if (!this.collection.where({ path: path }).length)
                {
                    this.collection.add({ path: path, storeType: storeType });
                    this.setDirty(true);
                }
            },
            removeSelected: function()
            {
                var paths = this.getSelectedPaths();
                var self = this;
                _.each(paths, function(path)
                {
                    self.collection.remove(self.collection.where({ path: path }));
                })
                if (paths.length)
                    this.setDirty(true);
            },
            getSelectedPaths: function()
            {
                return _.map(this.$el.find('td input[type="checkbox"]:checked').parent().parent().toArray(), function (r)
                {
                    return $(r).find('.repository-path').text();
                })

                
            },
            toggleSelection: function(e)
            {
                this.$el.find('td input[type="checkbox"]').prop('checked', e.currentTarget.checked ? 'checked' : null);

                var selectedPath = this.getSelectedPaths();
            },

            validate: function (displayErrors)
            {
                var errors = [];
                return errors;
            },
            setDirty: function(dirty)
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

                var repositories = this.model.get('settings').repositories;
                if (!repositories)
                    repositories = { custom: [] };

                repositories.custom.splice(0);
                this.$el.find('tbody tr').each(function (k, el)
                {
                    var customRepository =
                        { path: $(el).find('td.repository-path').text() };
                    repositories.custom.push(customRepository);
                });

                this.setDirty(false);

            }

        });

        var RepositoriesSection = Section.extend({
            init: function (options)
            {
                _.bindAll(this);
            },
            sectionId: function ()
            {
                return "repositories";
            },
            title: function ()
            {
                return "Repositories";
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
                return this.view.isDirty();
            },
            beforeSectionChange: function ()
            {
                return this.validate();
            },
            renderContent: function (options)
            {
                this.model = options.model;
                this.view = new View({ model: options.model });
                return this.view.render().$el;
            },
            close: function ()
            {
                this.view.close();
            }

        });

        return RepositoriesSection;

    }
)
