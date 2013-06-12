define(['require', 'jquery', 'underscore', 'backbone','Vent', 'App', 'logger'],
    function (require, $, _, Backbone, Vent, App, Logger)
    {

        function Base()
        {
        }
        _.extend(Base.prototype, Backbone.Events);

        /**
         * Creates an instance of Widget.
         *
         * @constructor
         * @this {Document}
         * @param {object} options Options
         */

        function Widget()
        {
        }

        Widget.extend = Backbone.Model.extend;
        _.inherit(Base, Widget);
        _.extend(Widget.prototype, 
            {
                id: function()
                {

                },
                title: function()
                {

                },
                init: function(widgetManager,options)
                {
                    this.widgetManager = widgetManager;
                    this.options = options || {};
                },
                beforeClose: function ()
                {

                },
                beforeShow: function()
                {

                },
                afterShow: function()
                {

                },
                close: function()
                {

                },
                renderContent: function(callback)
                {
                    throw new Error('Not Implemented');
                },
                /**
                 * Called when a title bar button is clicked (apart from 'close')
                 *
                 * @return {array} Array of string
                 */
                onButton: function (id)
                {

                },
                /**
                 * Specify what buttons additional to close to display in widget container title bar
                 *
                 * @return {array} Array of string - ['cog']
                 */
                buttons: function ()
                {
                    // cog
                    // close is standard

                },
                /**
                 * Return object of data to be stored with widget layout
                 *
                 * @return {array} Array of string
                 */
                getPersistenceData: function ()
                {

                },
                css: function ()
                {
                    // object map of:
                    // height
                    // max-height
                    // overflow...

                }
            })
        
        return Widget;
    }
)