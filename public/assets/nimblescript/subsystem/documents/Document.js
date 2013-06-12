define(['require', 'jquery', 'backbone','underscore', 'Vent', 'App', 'logger','mixins'],
    function (require, $, Backbone,_, Vent, App, Logger,_mixins)
    {

        function Base()
        {
        }
        _.extend(Base.prototype, Backbone.Events);
        
        /**
         * Creates an instance of Document.
         *
         * @constructor
         * @this {Document}
         * @param {object} options Options
         */

        function Document(options)
        {
        }

        Document.extend = Backbone.Model.extend;
        _.inherit(Base, Document);
        _.extend(Document.prototype, // Backbone.Events,
            {
                /**
                 * Return title of document
                 *
                 * @return {string} The current document title
                 */
                title: function()
                {

                },
                init: function(options)
                {
                    this.documentManager = options.documentManager;
                    this.container = options.container;
                },
                tooltip: function()
                {

                },
                id: function()
                {
                    return _.result(this.container, 'documentId');
                },
                beforeShow: function ()
                {

                },
                show: function($container)
                {
                    throw new Error('Not Implemented');
                },
                afterShow: function()
                {

                },
                beforeClose: function ()
                {

                },
                close: function()
                {

                },
                renderContent: function (callback)
                {
                    throw new Error('Not Implemented');
                },
                save: function ()
                {

                },
                /**
                 * Return array of supported actions for the document in it's current state
                 *
                 * @return {array} Array of string
                 */
                supportedActions: function ()
                {
                    return [];
                },
                doAction: function(action,options)
                {

                },
                isDirty: function ()
                {
                    return false;
                }
            })
        
        return Document;
    }
)