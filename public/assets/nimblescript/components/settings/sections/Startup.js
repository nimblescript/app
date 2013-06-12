define(['require', 'jquery', 'underscore', 'Vent', 'swig', 'marionette', 'App', 'logger', 'text!./startup.html', './Section',
    'jquery.txtinput'],
    function (require, $, _, Vent, Swig, Marionette, App, Logger,htmlTemplate, Section, $txtinput)
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
                'change [name=at-startup]': function () { this.setDirty(true) },
                'txtinput [name=marketplace-feed]': function () { this.setDirty(true) },
                'txtinput [name=blog-feed]': function () { this.setDirty(true) },
                'change [name=marketplace-show-latest]': function () { this.setDirty(true) },
                'change [name=blog-show-latest]': function () { this.setDirty(true) }
            },
            ui:
                {
                    atStartup: '[name=at-startup]',
                    marketplaceShowLatest: '[name=marketplace-show-latest]',
                    marketplaceFeed: '[name=marketplace-feed]',
                    blogShowLatest: '[name=blog-show-latest]',
                    blogFeed: '[name=blog-feed]'

            
                },
            onRender: function()
            {
                var settings = this.model.get('settings');
                this.ui.atStartup.val(settings.startup.atStartup);
                this.ui.marketplaceShowLatest.prop('checked', settings.startup.marketplaceShowLatest);
                this.ui.marketplaceFeed.val(settings.startup.marketplaceFeed);
                this.ui.blogShowLatest.prop('checked', settings.startup.blogShowLatest);
                this.ui.blogFeed.val(settings.startup.blogFeed);
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
            save: function ()
            {
                if (this.validate(false).length )
                    return false;

                var startupSettings = this.model.get('settings').startup;
                startupSettings.atStartup = this.ui.atStartup.val();
                startupSettings.marketplaceShowLatest = this.ui.marketplaceShowLatest.is(':checked');
                startupSettings.marketplaceFeed = this.ui.marketplaceFeed.val();
                startupSettings.blogShowLatest = this.ui.blogShowLatest.is(':checked');
                startupSettings.blogFeed = this.ui.blogFeed.val();
                this.setDirty(false);

            }

        });

        var StartupSection = Section.extend({
            // Public 'Section' interface
            init: function()
            {
                _.bindAll(this);
            },
            sectionId: function ()
            {
                return "startup";
            },
            parentSectionId: function()
            {
                return "environment";
            },
            title: function ()
            {
                return "Startup";
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

        return StartupSection;
    }
)
