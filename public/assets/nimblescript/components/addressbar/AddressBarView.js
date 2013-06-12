define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./addressbar.html'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, html)
    {
        "use strict"
        return Marionette.ItemView.extend(
            {
                template: Swig.compile(html),
                tagName: 'div',
                className: 'addressbar',
                initialize: function (options)
                {
                    this.options = _.defaults({}, options);
                },
                events: {
                    'focus .address': this._onFocus
                },
                onRender: function ()
                {
                    if (this.options.initialPath)
                        this.setPath(this.options.initialPath);
                },
                isDirty: function ()
                {
                },
                setPath: function (path)
                {
                    this._renderPath(path);
                },
                _onFocus: function ()
                {
                },
                _renderPath: function (path)
                {

                }


            });
    }
)
