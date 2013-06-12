define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./scriptsummarybuilder.html', 'text!./getsummary.html',
    'css!./scriptsummarybuilder.css', 'ace/ace', 'select2/select2', '../editor/EditorView'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, scriptSummaryBuilderHtml, getSummaryHtml,
        scriptSummaryBuilderCss, Ace, $select2, EditorView)
    {
        "use strict"

        return Marionette.Layout.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.Layout.prototype.constructor.apply(this, arguments);
                },
                events: {
                    'keyup form input, form textarea': 'updateSummary',
                    'change form select': 'updateSummary'
                },
                ui: {
                    title: 'form [name=title]',
                    author: 'form [name=author]',
                    description: 'form [name=description]',
                    version: 'form [name=version]',
                    modules: 'form [name=modules]'
                },
                template: Swig.compile(scriptSummaryBuilderHtml),
                tagName: 'div',
                className: 'script-summary-builder',
                regions: {
                    codeRegion: '.code'
                },
                initialize: function()
                {
                    this.options = _.defaults({}, this.options, { summary: {} });
                    this.getSummaryCompiled = Swig.compile(getSummaryHtml);
                    this.model = new Backbone.Model(this.options.summary);
                },
                onRender: function ()
                {
                    this.initEditor();
                    this.populateModules();
                    
                },
                onDomRefresh: function ()
                {
                },
                onClose: function ()
                {
                },
                // Custom 
                initEditor: function ()
                {
                    this.editor = new EditorView({ readonly: true });
                    this.codeRegion.show(this.editor);
                },
                populateModules: function()
                {
                    var self = this;
                    var sortedModules = this.options.modules.slice().sort(function (a, b)
                    {
                        return a.id > b.id;
                    });
                    this.ui.modules.empty();
                    _.each(sortedModules, function (module)
                    {
                        self.ui.modules.addSelectOption(module.id + ' - ' + module.title, module.id, false);
                    });
                    var requiredModules = this.model.get('requiredModules');
                    if (_.isArray(requiredModules))
                    {
                        _.each(requiredModules, function(requiredModuleId)
                        {
                            self.ui.modules.find('[value=' + requiredModuleId + ']').prop('selected', true);
                        })

                    }
                    this.ui.modules.select2({ width: 'off' });
                    this.updateSummary();
                    

                },
                updateSummary: function(e)
                {
                    this.summary = this.buildSummary();
                    var summaryObjectText = JSON.stringify(this.summary, null, 4);
                    this.summaryText = this.getSummaryCompiled({ summary: summaryObjectText });
                    this.editor.setValue(this.summaryText);
                    this.editor.clearSelection();
                },
                buildSummary: function ()
                {
                    var summary = {
                        title: this.ui.title.val(),
                        author: this.ui.author.val(),
                        description: this.ui.description.val(),
                        version: this.ui.version.val(),
                        requiredModules: []
                    };
                    _.defaults(summary, this.options.summary);
                    this.$el.find(':checked').each(function ()
                    {
                        summary.requiredModules.push($(this).val());
                    });
                    return summary;

                }

            });
    }
)
