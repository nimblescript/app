define(['require', 'jquery', 'underscore', 'marionette', 'App', 'backbone', 'swig', 'text!./documentcontainer.html'],
    function (require, $, _, Marionette, App, Backbone, Swig, documentContainerHtml)
    {
        "use strict"
        var _documentId = 1;
        var DocumentContainerView = Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    this.documentId = _documentId++;
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                id: function()
                {
                    return 'document-' + this.documentId;
                },
                objectType: 'DocumentContainer', 
                template: Swig.compile(documentContainerHtml),
                tagName: 'div',
                className: 'tab-pane document',
                initialize: function (options)
                {
                    this.model = new Backbone.Model({
                        title: _.result(options.document,'title'),
                        document_id: this.documentId
                    });
                    
                    this.document = options.document;
                    this.documentManager = options.documentManager;
                    this.document.init({ container: this, documentManager: this.documentManager });
                    this._super(options);
                    this.listenTo(this.document, 'all', function (eventName)
                    {
                        this.trigger(eventName, this);
                    },this);

                    
                },
                onRender: function ()
                {
                    var self = this;

                    this.document.renderContent(function ($content)
                    {
                        $content && self.$el.append($content);
                    });
                    
                },

                // Private
            })

        return DocumentContainerView;
    }
)