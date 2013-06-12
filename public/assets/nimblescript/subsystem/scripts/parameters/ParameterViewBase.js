define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', ],
    function (require, Backbone, Marionette, $, App, Swig, Logger)
    {
        "use strict"

        return Marionette.ItemView.extend(
            {
                template: Swig.compile(''),
                className: 'parameter',
                reset: function ()
                {
                    this.editorFields[0].editor.$el.val(this.model.get('initialValue'));
                },
                getValue: function ()
                {
                    return this.editorFields[0].editor.$el.val();

                },
                setValue: function (value)
                {
                    this.editorFields[0].editor.$el.val(value);
                }
            });


    }
)
