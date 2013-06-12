define(['require', 'jquery', 'underscore', 'Vent', 'swig', 'marionette', 'App', 'logger', 'text!./general.html', './Section'],
    function (require, $, _, Vent, Swig, Marionette, App, Logger,htmlTemplate, Section)
    {
        "use strict"


        var View = Marionette.ItemView.extend({
            template: Swig.compile(htmlTemplate),
            initialize: function ()
            {
                this._super();
                this._isDirty = false;
            },
            events: {
                'change [name=ui-theme]': 'changeUITheme',
                'change [name=script-editor-theme]': 'changeScriptEditorTheme'
            },
            ui:
                {
                    uiTheme: '[name=ui-theme]',
                    editorTheme: '[name=script-editor-theme]',
                    password: '[name=security-password]',
                    confirmPassword: '[name=security-confirm-password]',
                    webServerPort: '[name=webserver-port]',
                    webServerLocalhostOnly: '[name=webserver-localhost-only]',
                    userDataDirectory: '[name=userdata-directory]'
                },
            onRender: function()
            {
                // Guess I can migrate some of these to the Swig template
                var settings = this.model.get('settings');
                this.ui.uiTheme.find('option[value="' + settings.ui.theme + '"]').prop('selected', true);
                this.ui.editorTheme.find('option[value="' + settings.ui.scriptEditorTheme + '"]').prop('selected', true);
                this.ui.webServerPort.val(settings.webServer.port);
                this.ui.webServerLocalhostOnly.prop('checked', settings.webServer.localhostOnly);
                this.ui.userDataDirectory.val(settings.userDataDirectory);
            },
            // EVent handlers
            changeUITheme: function(e)
            {
                App.execute('ui:set-theme', $(e.currentTarget).val());
                this.setDirty(true);
            },
            changeScriptEditorTheme: function(e)
            {
                App.execute('ui:set-script-editor-theme', $(e.currentTarget).val());
                this.setDirty(true);
            },
            // Other
            setDirty: function (dirty)
            {
                this._isDirty = dirty;
            },
            isDirty: function ()
            {
                return this._isDirty;
            },
            validate: function (displayErrors)
            {
                var errors = [];
                return errors;
            },
            onClose: function()
            {
                // Undo any theme changes
                if (this.isDirty())
                {
                    var uiSettings = this.model.get('settings').ui;
                    App.execute('ui:set-theme', uiSettings.theme);
                }
            },
            save: function ()
            {
                if (this.validate(false).length )
                    return false;

                var uiSettings = this.model.get('settings').ui;
                uiSettings.theme = this.ui.uiTheme.val();
                uiSettings.scriptEditorTheme = this.ui.editorTheme.val();
                var webServerSettings = this.model.get('settings').webServer;
                webServerSettings.port = parseInt(this.ui.webServerPort.val());
                webServerSettings.localhostOnly = this.ui.webServerLocalhostOnly.is(':checked');
                this.setDirty(false);

            }

        });

        var GeneralSection = Section.extend({
            // Public 'Section' interface
            init: function()
            {
                _.bindAll(this);
            },
            sectionId: function ()
            {
                return "general";
            },
            parentSectionId: function()
            {
                return "environment";
            },
            title: function ()
            {
                return "General";
            },
            save: function()
            {
                return this.view.save();
            },
            isDirty: function()
            {
                return this.view.isDirty();
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

        return GeneralSection;
    }
)
