define(['jquery', 'underscore', 'marionette', 'backbone', 'Vent', 'subsystem/mainmenu/Menu'],
    function ($, _, Marionette, Backbone, Vent, Menu)
    {
        "use strict";
        return Marionette.Region.extend({
            el: '#menubar',
            onShow: function ()
            {

            }
        });
    }
);