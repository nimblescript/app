define(['require', 'jquery', 'underscore', 'Vent', 'swig', 'marionette', 'App', 'logger', 'text!./resources.html', 'text!./fileaccessdirectory.html', './Section', 'translate'],
    function (require, $, _, Vent, Swig, Marionette, App, Logger, resourcesHtml, fileAccessItemHtml,Section,T)
    {
        "use strict"

        var FileAccessItemView = Marionette.ItemView.extend({
            template: Swig.compile(fileAccessItemHtml),
            tagName: 'tr',
            onRender: function ()
            {
                this.$el.find('option[value=' + this.model.get('access') + ']').attr('selected', 'selected');
            }
        });

        var FileAccessView = Marionette.CollectionView.extend({
            itemView: FileAccessItemView,
            tagName: 'tbody',
            appendHtml: function (collectionView, itemView)
            {
                collectionView.$el.append(itemView.$el);
            }
        });


        var View = Marionette.Layout.extend({
            template: Swig.compile(resourcesHtml),
            constructor: function()
            {
                _.bindAll(this);
                Marionette.Layout.prototype.constructor.apply(this, arguments);
            },
            initialize: function (options)
            {
                this._super();
                this.collection = this.createFileAccessCollection(this.model.get('settings').allowedFileAccessDirectories);
                this._isDirty = false;
            },
            regions:
                {
                    fileSystemAccess: 'table.file-system-access'
                },
            events: {
                'click a.add-dir': 'browseForDir',
                'click a.remove-dir': 'removeSelected',
                'click input.toggle-all': 'toggleSelection'
            },
            onRender: function()
            {
                this.fileSystemAccess.ensureEl();
                this.fileSystemAccess.$el.append(new FileAccessView(
                    { collection: this.collection  }).render().$el);


            },
            createFileAccessCollection: function (dirs)
            {
                var coll = new Backbone.Collection(dirs);
                return coll;
            },
            browseForDir: function()
            {
                var self = this;
                App.execute('components:get', ['xemware.nimblescript.component.fileexplorer'], function (err, Components)
                {
                    Components[0].showModal({
                        allowedItems: ['dir'], title: 'Select a directory...',
                        mode: 'openDir',
                        onOK: function (selectedItems)
                        {
                            self.addDir(selectedItems[0].key, 'R')
                            return true;
                        }
                    });
                });

            },
            addDir: function(path, access)
            {
                if (!this.collection.where({ path: path }).length)
                {
                    this.collection.add({ path: path, access: 'R' });
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
                    return $(r).find('.file-system-directory').text();
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

                var allowedFileAccessDirectories = this.model.get('settings').allowedFileAccessDirectories;
                allowedFileAccessDirectories.splice(0);
                this.$el.find('tbody tr').each(function (k, el)
                {
                    var allowedFileAccessDirectory =
                        { path: $(el).find('td.file-system-directory').text(), access: $(el).find('td.file-system-access select').val() };
                    allowedFileAccessDirectories.push(allowedFileAccessDirectory);
                });
                this.setDirty(false);
            }

        });

        var ResourcesSection = Section.extend({
            init: function (options)
            {
                _.bindAll(this);
            },
            sectionId: function ()
            {
                return "resources";
            },
            title: function ()
            {
                return "Resources";
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

        // Section.addToClass(View);
        return ResourcesSection;

    }
)
