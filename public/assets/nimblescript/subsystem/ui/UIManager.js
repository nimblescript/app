define(['require', 'jquery', 'underscore', 'Vent', 'App', 'logger'],
    function (require, $, _, Vent, App, Logger)
    {
        "use strict"

        // TODO: Review this

        // Global handlers
        App.commands.setHandler('ui:set-theme', function (theme)
        {
            $('#bootstrap-theme').attr('href', '../assets/css/bootstrap-themes/bootstrap-' + theme + '.css');
            $('#bootstrap-theme-custom').attr('href', '../assets/css/bootstrap-themes/custom-' + theme + '.css');
            Vent.trigger('ui', { eVent: 'theme-changed', newTheme: theme });
        })

        App.commands.setHandler('ui:set-script-editor-theme', function (theme)
        {
            Vent.trigger('ui', { eVent: 'script-editor-theme-changed', newTheme: theme });
        })


    }
);